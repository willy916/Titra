# Modifications apportées - Système de gestion des commandes et Panier

## Vue d'ensemble

Deux améliorations majeures ont été apportées au système :

### 1. Système de gestion des commandes en deux parties
Le système de commandes permet aux profils qui peuvent à la fois vendre et acheter des produits de gérer deux types de commandes distincts :

1. **Commandes clients** : Pour suivre les commandes de leurs clients (en tant que vendeur)
2. **Mes commandes personnelles** : Pour suivre leurs propres achats (en tant qu'acheteur)

### 2. Fonctionnalité Panier pour tous les vendeurs
Tous les profils ayant accès à la marketplace peuvent maintenant utiliser un panier pour acheter des produits chez d'autres vendeurs.

## Profils concernés

### Système de commandes dual
Cette fonctionnalité s'applique aux profils suivants :
- Producteur (farmer)
- Transformateur (processor)
- Commerçant (merchant)
- Coopérative (cooperative)
- Association (association)
- Union (union)
- Fédération (federation)
- Interprofession (interprofession)

**Note** : Les consommateurs (consumer) ont un accès direct à leurs commandes car ils ne vendent pas de produits.

### Fonctionnalité Panier
Tous les profils ci-dessus disposent maintenant d'un bouton panier dans le header avec :
- Badge affichant le nombre d'articles dans le panier
- Accès direct à la vue panier en un clic
- Icône ShoppingCart visible en permanence

## Nouveaux fichiers créés

### 1. `src/views/orders/OrderTypeSelectionView.vue`
Interface de sélection du type de commandes à consulter. Présente deux cartes :
- **Commandes clients** : Redirige vers `CustomerOrdersView`
- **Mes commandes** : Redirige vers `MyPersonalOrdersView`

### 2. `src/views/orders/CustomerOrdersView.vue`
Interface de gestion des commandes clients (pour les vendeurs) avec :
- 5 onglets de filtrage : En attente, Préparation, En route, Livrées, Annulées
- Affichage des informations client
- Navigation vers les détails de la commande

### 3. `src/views/orders/MyPersonalOrdersView.vue`
Interface de suivi des commandes personnelles (pour les acheteurs) avec :
- 3 onglets : En cours, Livrées, Annulées
- **Barre de progression visuelle** montrant l'état d'avancement de la commande (Confirmée → Préparation → Livraison → Livrée)
- Affichage des informations vendeur et adresse de livraison
- Design optimisé pour le suivi en temps réel

## Fichiers modifiés

### Système de commandes

### 1. `src/stores/order.ts`
**Ajouts** :
- Variable `personalOrders` pour stocker les commandes personnelles
- Fonction `getPersonalOrdersBaseUrl()` pour gérer les endpoints des commandes personnelles
- Fonction `fetchMyPersonalOrders(statuses: string[])` pour récupérer les commandes personnelles

**Points d'API** :
- Commandes vendeur : `/api/{role}/orders`
- Commandes acheteur : `/api/{role}/my-purchases`

### 2. `src/App.vue`
**Ajouts** :
- Import des trois nouvelles vues
- Logique conditionnelle pour afficher la bonne vue selon le rôle :
  - Profils vendeurs/acheteurs → `OrderTypeSelectionView`
  - Consommateurs → Accès direct à `OrdersView`
- Gestion du retour depuis `OrderDetailView` vers le bon écran parent

### Fonctionnalité Panier

### 3. Fichiers Home modifiés pour le panier
Tous les fichiers suivants ont été modifiés pour inclure le bouton panier dans le header :

**`src/views/home/FarmerHome.vue`** :
- Import de `ShoppingCart` et `useCartStore`
- Computed `cartItemsCount` pour afficher le nombre d'articles
- Bouton panier avec badge dans le header

**`src/views/home/MerchantHome.vue`** :
- Import de `useCartStore` (ShoppingCart déjà présent)
- Computed `cartItemsCount`
- Bouton panier avec badge dans le header

**`src/views/home/TransformerHome.vue`** :
- Import de `ShoppingCart` et `useCartStore`
- Computed `cartItemsCount`
- Bouton panier avec badge dans le header

**`src/views/home/CooperativeHome.vue`** :
- Import de `ShoppingCart` et `useCartStore`
- Computed `cartItemsCount`
- Bouton panier avec badge dans le header

**`src/views/home/InstitutionHome.vue`** :
- Import de `ShoppingCart` et `useCartStore`
- Computed `cartItemsCount`
- Bouton panier avec badge dans le header

Chaque fichier suit le même pattern :
```vue
<button @click="emit('navigate', 'cart')" class="relative w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
  <ShoppingCart class="w-5 h-5" />
  <span v-if="cartItemsCount > 0" class="absolute -top-1 -right-1 bg-secondary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-primary">
    {{ cartItemsCount }}
  </span>
</button>
```

### 4. Composants de navigation modifiés

**`src/components/navigation/Sidebar.vue`** :
- Ajout du bouton "Panier" dans la section Commerce pour tous les profils ayant accès à la marketplace
- Order : Mes produits → Marketplace → **Panier** → Commandes
- Le panier affiche un badge avec le nombre d'articles

**`src/components/navigation/MobileSidebar.vue`** :
- Même modification que Sidebar.vue pour la version mobile
- Garantit une expérience cohérente sur tous les appareils

## Flux de navigation

### Pour les vendeurs/acheteurs (farmer, processor, merchant, etc.)
```
Home → Bouton "Mes commandes" → OrderTypeSelectionView
                                    ↓
                    ┌───────────────┴────────────────┐
                    ↓                                ↓
            CustomerOrdersView              MyPersonalOrdersView
                    ↓                                ↓
                OrderDetailView ←──────────────────┘
```

### Pour les consommateurs (consumer)
```
Home → Bouton "Mes commandes" → OrdersView (direct)
                                    ↓
                              OrderDetailView
```

## Fonctionnalités clés

### OrderTypeSelectionView
- Design avec cartes interactives
- Icônes distinctifs (Users pour clients, ShoppingCart pour personnel)
- Animation au survol et au clic

### CustomerOrdersView
- Reprise de la logique existante de `OrdersView`
- Gestion complète des statuts de commande
- Interface optimisée pour les vendeurs

### MyPersonalOrdersView
- **Nouveauté** : Barre de progression visuelle à 4 étapes
- Affichage de l'adresse de livraison avec icône MapPin
- Information sur le vendeur
- Design centré sur l'expérience d'achat

## Intégration backend requise

Pour que cette fonctionnalité soit pleinement opérationnelle, le backend doit implémenter les endpoints suivants :

```
GET /api/{role}/my-purchases?status=EN_ATTENTE,EN_PREPARATION,EN_COURS
```

Où `{role}` peut être : `paysan`, `transform`, `commercant`, `cooperative`, `association`, `union`, `federation`, `interprofession`

**Réponse attendue** : Liste des commandes où l'utilisateur actuel est l'acheteur.

## Tests recommandés

### Système de commandes
1. Vérifier la navigation depuis le home vers "Mes commandes"
2. Tester la sélection entre "Commandes clients" et "Mes commandes"
3. Vérifier le filtrage par statut dans chaque vue
4. Tester la barre de progression pour différents statuts
5. Vérifier le retour correct depuis OrderDetailView
6. Tester avec différents rôles (farmer, processor, merchant, etc.)
7. Vérifier que les consommateurs ont un accès direct

### Fonctionnalité Panier
1. Vérifier que le bouton panier apparaît dans le header pour tous les profils (sauf consumer qui l'avait déjà)
2. **Vérifier que le bouton panier apparaît dans la sidebar et la sidebar mobile pour tous les profils ayant accès à la marketplace**
3. Tester l'ajout de produits au panier depuis la marketplace
4. Vérifier que le badge affiche le bon nombre d'articles (dans le header ET dans la sidebar)
5. Tester la navigation vers la vue panier depuis le header et depuis la sidebar
6. Vérifier que le compteur se met à jour en temps réel dans les deux emplacements
7. Tester avec un panier vide (badge ne doit pas apparaître)
8. Tester avec plusieurs articles dans le panier
9. Tester la version mobile de la sidebar

## Notes de développement

- Tous les fichiers utilisent la composition API de Vue 3
- Les styles sont basés sur Tailwind CSS
- La gestion des états utilise Pinia
- Les icônes proviennent de `lucide-vue-next`
- Responsive design adapté mobile-first

## Résumé des modifications

### Fichiers créés (3)
1. `src/views/orders/OrderTypeSelectionView.vue` - Interface de sélection
2. `src/views/orders/CustomerOrdersView.vue` - Gestion des commandes clients
3. `src/views/orders/MyPersonalOrdersView.vue` - Suivi des achats personnels

### Fichiers modifiés (10)
1. `src/stores/order.ts` - Ajout des commandes personnelles
2. `src/App.vue` - Intégration des nouvelles vues
3. `src/views/home/FarmerHome.vue` - Ajout du panier
4. `src/views/home/MerchantHome.vue` - Ajout du panier
5. `src/views/home/TransformerHome.vue` - Ajout du panier
6. `src/views/home/CooperativeHome.vue` - Ajout du panier
7. `src/views/home/InstitutionHome.vue` - Ajout du panier
8. `src/components/navigation/Sidebar.vue` - Ajout du bouton panier dans la sidebar
9. `src/components/navigation/MobileSidebar.vue` - Ajout du bouton panier dans la sidebar mobile
10. `MODIFICATIONS_README.md` - Documentation des changements

## Évolutions futures possibles

### Système de commandes
1. Notifications push pour changement de statut
2. Chat direct avec le vendeur/acheteur
3. Historique détaillé de suivi (date/heure de chaque étape)
4. Évaluation et notation après livraison
5. Demande de remboursement/retour
6. Export PDF de la commande

### Fonctionnalité Panier
1. Sauvegarde du panier en localStorage pour persistance
2. Suggestions de produits complémentaires
3. Application de codes promo/réductions
4. Calcul des frais de livraison par vendeur
5. Panier groupé par vendeur
6. Panier partagé pour les coopératives
