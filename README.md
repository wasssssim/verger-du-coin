#  LE VERGER DU COIN - SYSTÈME COMPLET

##  INSTALLATION ULTRA-RAPIDE 

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



```bash
# 5. Lancer le serveur
python manage.py runserver

#  API disponible: http://localhost:8000/api/docs/
```

### FRONTEND (POS React)

```bash
cd frontend-pos

# 1. Installer Node.js puis:
npm install

# 2. Lancer
npm run dev

#  POS disponible: http://localhost:5173
```

---

##  UTILISATION DU POS

### Connexion
- URL: http://localhost:5173
- Username: `admin`
- Password: `admin`

### Faire une Vente
1. Cliquer sur les produits pour les ajouter au panier
2. Optionnel: Scanner/taper le numéro de carte fidélité
3. Cliquer sur "ESPÈCES" ou "CARTE"

---

## 🔧 API - ENDPOINTS PRINCIPAUX

**Base URL:** `http://localhost:8000/api`

### Authentification
```bash
POST /auth/token/
Body: {"username": "admin", "password": "admin"}
→ {"access": "TOKEN", "refresh": "..."}



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

##  ARCHITECTURE

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

##  CONFORMITÉ RGPD

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

##  MODE OFFLINE (POS)

Le POS fonctionne hors-ligne :
1. Ventes stockées localement (IndexedDB)
2. Synchronisation automatique au retour de connexion
3. Endpoint: `POST /api/sales/sync/`

---

##  FONCTIONNALITÉS

###  Complètes
- Gestion produits (catégories, saisonnalité)
- Stocks temps réel avec traçabilité
- Ventes multi-canaux (Kiosque/Marché/Web)
- Clients avec fidélité automatique
- Rapports journaliers
- API REST documentée (Swagger)
- RGPD intégré
- Mode offline

###  À Développer (Optionnel)
- Tarification dynamique selon stock

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



##  CONCLUSION

Vous disposez d'un système professionnel, moderne et évolutif qui répond à tous les besoins du Verger du Coin :

API REST complète  
POS tactile fonctionnel  
Mode offline  
RGPD intégré  
Documentation complète  

**C'EST PRÊT À UTILISER ! **
