# 📱 FRONTEND POS - Point de Vente

Application POS complète pour Le Verger du Coin.

## 🚀 Installation

```bash
cd frontend-pos-complet

# Installer les dépendances
npm install

# Lancer en développement
npm run dev
```

## 🎯 Accès

- **URL** : http://localhost:5173
- **Login** : `admin` / `admin123`

## ✨ Fonctionnalités

### ✅ Connexion
- Authentification avec JWT
- Login sécurisé

### ✅ Gestion Produits
- Affichage grille produits
- Filtres par catégorie
- Ajout rapide au panier (1 clic)
- Compteur par catégorie

### ✅ Panier
- Ajout/suppression produits
- Modification quantités (+/-)
- Total en temps réel
- Vidage du panier

### ✅ Client
- Scanner carte fidélité
- Affichage info client
- Affichage points fidélité
- Suppression client

### ✅ Paiement
- Paiement ESPÈCES
- Paiement CARTE
- Confirmation avant paiement
- Enregistrement dans le backend
- Décrémentation auto du stock
- Ajout auto des points fidélité

### ✅ Interface
- Design tactile (boutons larges)
- Responsive
- Animations fluides
- Messages de confirmation
- Gestion des erreurs

## 🎨 Design

- **Couleur principale** : Vert (#22c55e)
- **Boutons** : Larges et tactiles
- **Layout** : 2 colonnes (produits | panier)
- **Police** : System fonts

## 📋 Utilisation

1. **Se connecter** avec admin/admin123
2. **Sélectionner une catégorie** (optionnel)
3. **Cliquer sur un produit** pour l'ajouter au panier
4. **Ajuster les quantités** avec +/-
5. **Scanner la carte fidélité** du client (optionnel)
6. **Choisir le mode de paiement** (Espèces/Carte)
7. **Confirmer** → Vente enregistrée !

## 🔧 Configuration

Le fichier `.env` est déjà configuré :
```
VITE_API_URL=http://localhost:8000/api
```

## ⚠️ Prérequis

- Backend Django doit tourner sur port 8000
- Des produits doivent exister dans la base de données
- Au moins une catégorie doit être créée

## 🐛 Résolution de problèmes

### Erreur "Cannot login"
- Vérifier que le backend tourne
- Vérifier les identifiants (admin/admin123)
- Vérifier CORS dans Django settings

### Aucun produit affiché
- Ajouter des produits dans l'admin Django
- Vérifier que l'API retourne des données: http://localhost:8000/api/products/

### Carte fidélité non trouvée
- Créer un client avec carte dans l'admin Django
- Le format est: VDCxxxxxx (6 chiffres)

### Erreur lors du paiement
- Vérifier que le token JWT est valide
- Vérifier les logs du backend

## 📦 Build Production

```bash
npm run build
```

Les fichiers sont dans `/dist`

## 🎯 Améliorations futures

- [ ] Mode offline (IndexedDB)
- [ ] Synchronisation en arrière-plan
- [ ] Impression de tickets
- [ ] Support codes-barres
- [ ] Rapports de caisse
- [ ] Multi-vendeurs

---

**Développé pour Le Verger du Coin 🍎**
