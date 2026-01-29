# API COMPLETE - Serializers et Views
from rest_framework import serializers, viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from django.utils import timezone

from sfs_products.models import Product, ProductCategory
from sfs_inventory.models import Stock, StockLocation, StockMovement
from sfs_customers.models import Customer, LoyaltyCard
from sfs_sales.models import Sale, SaleLine, DailyReport

# === PRODUCTS SERIALIZERS ===
class ProductCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCategory
        fields = ['id', 'name', 'display_order', 'is_active']

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    in_season = serializers.BooleanField(source='is_in_season', read_only=True)
    
    class Meta:
        model = Product
        fields = ['id', 'code', 'name', 'category', 'category_name', 'description', 
                  'base_price', 'unit', 'vat_rate', 'is_active', 'is_seasonal', 
                  'in_season', 'image', 'created_at']

# === INVENTORY SERIALIZERS ===
class StockLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockLocation
        fields = ['id', 'code', 'name', 'is_active']

class StockSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    location_name = serializers.CharField(source='location.name', read_only=True)
    available_quantity = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Stock
        fields = ['id', 'product', 'product_name', 'location', 'location_name', 
                  'quantity', 'reserved_quantity', 'available_quantity', 
                  'low_stock_threshold', 'is_low_stock', 'last_updated']

class StockMovementSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockMovement
        fields = ['id', 'stock', 'movement_type', 'quantity', 'reference', 'note', 'created_at']

# === CUSTOMERS SERIALIZERS ===
class CustomerSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    
    class Meta:
        model = Customer
        fields = ['id', 'internal_id', 'first_name', 'last_name', 'full_name', 
                  'email', 'phone', 'address_line1', 'postal_code', 'city',
                  'is_active', 'is_anonymized', 'marketing_consent', 
                  'newsletter_consent', 'last_purchase_date', 'created_at']
        read_only_fields = ['internal_id', 'is_anonymized']

class LoyaltyCardSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    
    class Meta:
        model = LoyaltyCard
        fields = ['id', 'customer', 'customer_name', 'card_number', 
                  'points_balance', 'total_points_earned', 'is_active']

# === SALES SERIALIZERS ===
class SaleLineSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    line_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = SaleLine
        fields = ['id', 'product', 'product_name', 'quantity', 'unit_price', 
                  'vat_rate', 'discount_percent', 'line_total']

class SaleSerializer(serializers.ModelSerializer):
    lines = SaleLineSerializer(many=True, read_only=True)
    customer_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Sale
        fields = ['id', 'sale_number', 'channel', 'location', 'customer', 'customer_name',
                  'subtotal', 'vat_amount', 'discount_amount', 'total', 
                  'payment_method', 'is_paid', 'status', 'lines', 'created_at', 'synced']
        read_only_fields = ['sale_number']
    
    def get_customer_name(self, obj):
        return obj.customer.full_name if obj.customer else "Client anonyme"

class SaleCreateSerializer(serializers.ModelSerializer):
    lines = SaleLineSerializer(many=True)
    
    class Meta:
        model = Sale
        fields = ['channel', 'location', 'customer', 'payment_method', 'lines', 'offline_created_at']
    
    @transaction.atomic
    def create(self, validated_data):
        lines_data = validated_data.pop('lines')
    
        # FORCE is_paid à True pour les ventes KIOSK
        sale = Sale.objects.create(is_paid=True, status='COMPLETED', **validated_data)
    
        subtotal = 0
        vat_amount = 0

        for line_data in lines_data:
            product = line_data['product']
            # On s'assure d'avoir les prix
            u_price = line_data.get('unit_price', product.base_price)
            v_rate = line_data.get('vat_rate', product.vat_rate)
        
            line = SaleLine.objects.create(
                sale=sale, 
                product=product,
                quantity=line_data['quantity'],
                unit_price=u_price,
                vat_rate=v_rate
            )
            subtotal += line.line_total
            vat_amount += line.vat_amount

        # Mise à jour et sauvegarde réelle des totaux de la vente
        sale.subtotal = subtotal
        sale.vat_amount = vat_amount
        sale.total = subtotal + vat_amount
        sale.save()

        # === LOGIQUE FIDÉLITÉ (LA RÉPARATION) ===
        if sale.customer:
            try:
            # 1. Récupérer ou créer la carte
                loyalty_card, created = LoyaltyCard.objects.get_or_create(
                    customer=sale.customer,
                    defaults={'card_number': f"VDC-{sale.customer.internal_id}"}
                )
            
            # 2. Ajouter les points (1€ = 1pt)
            # On passe le total de la vente à ta méthode add_points
                points_gagnes = loyalty_card.add_points(sale.total)
            
            # 3. Mettre à jour le client
                sale.customer.last_purchase_date = timezone.now()
                sale.customer.save()
            
                print(f"SUCCÈS : {points_gagnes} points ajoutés au client {sale.customer.last_name}")
            
            except Exception as e:
                print(f"ERREUR FIDÉLITÉ : {str(e)}")
            # On ne bloque pas la vente si la fidélité bug, mais on log l'erreur
            
        return sale

class DailyReportSerializer(serializers.ModelSerializer):
    location_name = serializers.CharField(source='location.name', read_only=True)
    cash_difference = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = DailyReport
        fields = ['id', 'date', 'location', 'location_name', 'total_sales_count', 
                  'total_revenue', 'total_cash', 'total_card', 'expected_cash', 
                  'actual_cash', 'cash_difference', 'is_validated', 'notes']

# === VIEWSETS ===
class ProductCategoryViewSet(viewsets.ModelViewSet):
    queryset = ProductCategory.objects.filter(is_active=True)
    serializer_class = ProductCategorySerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category', 'is_seasonal']
    search_fields = ['name', 'code']
    
    @action(detail=False)
    def in_season(self, request):
        products = [p for p in self.get_queryset() if p.is_in_season]
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)

class StockLocationViewSet(viewsets.ModelViewSet):
    queryset = StockLocation.objects.filter(is_active=True)
    serializer_class = StockLocationSerializer

class StockViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['product', 'location']
    
    @action(detail=False)
    def low_stock(self, request):
        stocks = [s for s in self.get_queryset() if s.is_low_stock]
        serializer = self.get_serializer(stocks, many=True)
        return Response(serializer.data)

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.filter(is_active=True, is_anonymized=False)
    serializer_class = CustomerSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'email']
    
    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return super().get_permissions()
    
    @action(detail=True, methods=['post'])
    def anonymize(self, request, pk=None):
        customer = self.get_object()
        customer.anonymize()
        return Response({'message': 'Client anonymisé'})
    
    @action(detail=False, methods=['post'])
    def search_by_card(self, request):
        card_number = request.data.get('card_number')
        try:
            card = LoyaltyCard.objects.get(card_number=card_number)
            return Response({
                'customer': CustomerSerializer(card.customer).data,
                'loyalty_card': LoyaltyCardSerializer(card).data
            })
        except LoyaltyCard.DoesNotExist:
            return Response({'error': 'Carte non trouvée'}, status=404)

class LoyaltyCardViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LoyaltyCard.objects.filter(is_active=True)
    serializer_class = LoyaltyCardSerializer

class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.all()
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['channel', 'location', 'customer', 'status']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return SaleCreateSerializer
        return SaleSerializer
    
    @action(detail=False, methods=['post'])
    def sync(self, request):
        sales_data = request.data.get('sales', [])
        synced = []
        for sale_data in sales_data:
            serializer = SaleCreateSerializer(data=sale_data)
            if serializer.is_valid():
                sale = serializer.save()
                sale.synced = True
                sale.save()
                synced.append(sale)
        
        return Response({
            'synced_count': len(synced),
            'sales': SaleSerializer(synced, many=True).data
        })
    
    @action(detail=False)
    def statistics(self, request):
        from django.db.models import Sum, Count
        sales = self.get_queryset().filter(status='COMPLETED')
        return Response({
            'total_sales': sales.count(),
            'total_revenue': float(sales.aggregate(Sum('total'))['total__sum'] or 0),
            'by_channel': {
                channel: sales.filter(channel=code).count()
                for code, channel in Sale.CHANNELS
            }
        })

class DailyReportViewSet(viewsets.ModelViewSet):
    queryset = DailyReport.objects.all()
    serializer_class = DailyReportSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['location', 'is_validated']
