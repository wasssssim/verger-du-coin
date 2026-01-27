# 🍎 LE VERGER DU COIN - SYSTÈME COMPLET

## 🚀 INSTALLATION ULTRA-RAPIDE (15 minutes)

### BACKEND (API Django)

```bash
cd backend

# 1. Installer Python et dépendances
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 2. Créer la base de données
python manage.py makemigrations sfs_products sfs_inventory sfs_customers sfs_sales
python manage.py migrate

# 3. Créer un admin
python manage.py createsuperuser
# Username: admin
# Password: admin123

# 4. Charger des données de test
python manage.py shell
```

```python
# Dans le shell Python, copier-coller:
from sfs_products.models import *
from sfs_inventory.models import *
from sfs_customers.models import *
from decimal import Decimal
import random

# Catégories
fruits = ProductCategory.objects.create(name="Fruits", display_order=1)
legumes = ProductCategory.objects.create(name="Légumes", display_order=2)

# Produits
products_data = [
    ("POM001", "Pommes Golden", fruits, 3.50),
    ("POM002", "Pommes Granny", fruits, 3.80),
    ("POI001", "Poires", fruits, 4.20),
    ("TOM001", "Tomates", legumes, 5.00),
    ("CAR001", "Carottes", legumes, 2.50),
    ("SAL001", "Salade", legumes, 1.80),
]

for code, name, cat, price in products_data:
    Product.objects.create(
        code=code, name=name, category=cat,
        base_price=Decimal(str(price)), unit="KG", vat_rate=Decimal("5.5")
    )

# Lieux
kiosque = StockLocation.objects.create(code="KIOSK", name="Kiosque à la ferme")
marche = StockLocation.objects.create(code="MARKET", name="Marchés fermiers")

# Stocks
for product in Product.objects.all():
    for location in [kiosque, marche]:
        Stock.objects.create(
            product=product, location=location,
            quantity=Decimal("100"), low_stock_threshold=Decimal("10")
        )

# Client test
customer = Customer.objects.create(
    first_name="Jean", last_name="Dupont",
    email="jean@test.fr", phone="0612345678",
    marketing_consent=True, newsletter_consent=True
)

# Carte fidélité
LoyaltyCard.objects.create(
    customer=customer,
    card_number=f"VDC{random.randint(100000,999999)}",
    points_balance=150
)

print("✅ Données de test créées!")
print(f"Carte fidélité: {customer.loyalty_card.card_number}")
```

```bash
# 5. Lancer le serveur
python manage.py runserver

# ✅ API disponible: http://localhost:8000/api/docs/
```

### FRONTEND (POS React)

```bash
cd frontend-pos

# 1. Installer Node.js puis:
npm install

# 2. Lancer
npm run dev

# ✅ POS disponible: http://localhost:5173
```

---

## 📱 UTILISATION DU POS

### Connexion
- URL: http://localhost:5173
- Username: `admin`
- Password: `admin123`

### Faire une Vente
1. Cliquer sur les produits pour les ajouter au panier
2. Optionnel: Scanner/taper le numéro de carte fidélité
3. Cliquer sur "ESPÈCES" ou "CARTE"
4. ✅ Vente enregistrée !

---

## 🔧 API - ENDPOINTS PRINCIPAUX

**Base URL:** `http://localhost:8000/api`

### Authentification
```bash
POST /auth/token/
Body: {"username": "admin", "password": "admin123"}
→ {"access": "TOKEN", "refresh": "..."}

# Utiliser ensuite:
Header: Authorization: Bearer TOKEN
```

### Produits
```bash
GET /products/                    # Liste
GET /products/in_season/          # Produits de saison
GET /products/?category=1         # Par catégorie
POST /products/                   # Créer (admin)
```

### Stocks
```bash
GET /inventory/stocks/            # État des stocks
GET /inventory/stocks/low_stock/  # Alertes stock faible
GET /inventory/locations/         # Lieux de stockage
```

### Clients
```bash
GET /customers/                          # Liste
POST /customers/                         # Créer nouveau client
POST /customers/search_by_card/          # Recherche par carte fidélité
  Body: {"card_number": "VDC123456"}
POST /customers/{id}/anonymize/          # RGPD - Anonymiser
```

### Ventes
```bash
POST /sales/                      # Créer vente
  Body: {
    "channel": "KIOSK",
    "location": 1,
    "customer": 1,  # optionnel
    "payment_method": "CASH",
    "lines": [
      {"product": 1, "quantity": 2.5, "unit_price": 3.50, "vat_rate": 5.5}
    ]
  }

GET /sales/statistics/            # Statistiques
POST /sales/sync/                 # Sync ventes offline
```

---

## 📊 ARCHITECTURE

```
Backend (Django)
├── sfs_products     → Produits et catégories
├── sfs_inventory    → Stocks en temps réel
├── sfs_customers    → Clients (RGPD compliant)
├── sfs_sales        → Ventes multi-canaux
└── sfp_pricing      → Tarification dynamique

Frontend POS (React)
└── Application tablette avec mode offline
```

---

## 🛡️ CONFORMITÉ RGPD

### Consentements
- Opt-in explicite pour marketing/newsletter
- Horodatage automatique

### Droits
```bash
# Export données
GET /api/customers/{id}/export_data/

# Anonymisation (garde historique ventes)
POST /api/customers/{id}/anonymize/
```

---

## 🔥 MODE OFFLINE (POS)

Le POS fonctionne hors-ligne :
1. Ventes stockées localement (IndexedDB)
2. Synchronisation automatique au retour de connexion
3. Endpoint: `POST /api/sales/sync/`

---

## 🎯 FONCTIONNALITÉS

### ✅ Complètes
- Gestion produits (catégories, saisonnalité)
- Stocks temps réel avec traçabilité
- Ventes multi-canaux (Kiosque/Marché/Web)
- Clients avec fidélité automatique
- Rapports journaliers
- API REST documentée (Swagger)
- RGPD intégré
- Mode offline

### 🔄 À Développer (Optionnel)
- Tarification dynamique selon stock
- Abonnements paniers hebdomadaires
- Site web Click & Collect
- Statistiques avancées
- Intégration paiement en ligne

---

## 📈 DONNÉES DE TEST

Après l'installation, vous avez :
- 6 produits (pommes, poires, tomates, carottes, salade)
- 2 lieux (Kiosque, Marché)
- Stocks initiaux de 100 unités
- 1 client test : Jean Dupont
- 1 carte fidélité avec 150 points

---

## 🆘 DÉPANNAGE

### Erreur "Module not found"
```bash
cd backend
pip install -r requirements.txt
```

### Erreur base de données
```bash
rm db.sqlite3
rm sfs_*/migrations/00*.py
python manage.py makemigrations
python manage.py migrate
```

### Frontend ne démarre pas
```bash
cd frontend-pos
rm -rf node_modules package-lock.json
npm install
```

### CORS Error
Vérifier que le backend tourne sur port 8000 et frontend sur 5173

---

## 📞 SUPPORT

**Documentation API:** http://localhost:8000/api/docs/  
**Admin Django:** http://localhost:8000/admin/

---

## 🎓 POUR ALLER PLUS LOIN

### Déploiement Production
1. Changer `SECRET_KEY` et `DEBUG=False`
2. Utiliser PostgreSQL au lieu de SQLite
3. Configurer Nginx + Gunicorn
4. Activer HTTPS (Let's Encrypt)
5. Backup automatique S3

### Frontend Web (Click & Collect)
Copier la structure du POS et adapter pour :
- Catalogue produits public
- Panier persistant
- Formulaire livraison
- Paiement Stripe

### Formation Équipe
1. Démonstration POS (30 min)
2. Test sur données fictives (1h)
3. Go-live progressif

---

## 💰 BUDGET

**Déjà développé** : Backend complet + POS fonctionnel  
**Estimé** : 12 000€ de développement

**Reste à faire** :
- Frontend Web : 3 000€
- Déploiement : 1 000€
- Formation : 500€

**TOTAL** : ~16 500€

---

## ✨ CONCLUSION

Vous disposez d'un système professionnel, moderne et évolutif qui répond à tous les besoins du Verger du Coin :

✅ API REST complète  
✅ POS tactile fonctionnel  
✅ Mode offline  
✅ RGPD intégré  
✅ Documentation complète  

**C'EST PRÊT À UTILISER ! 🚀**
