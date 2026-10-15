# Activer les paiements réels — Ti Kay Livraison

Le site statique hébergé sur GitHub Pages ne peut pas exécuter de code serveur. Ce projet inclut une fonction Netlify qui crée une session Stripe Checkout côté serveur. **Les paiements ne fonctionneront pas tant que le projet n’est pas déployé sur Netlify et que les clés Stripe ne sont pas configurées.**

## Déploiement

1. Connectez-vous à Netlify et importez le dépôt GitHub `dj3363015-tech/portfolio`.
2. Configurez le **Base directory** sur `projects/ti-kay-livraison`. Gardez le publish directory sur `.` et les fonctions dans `netlify/functions`.
3. Dans les paramètres du site Netlify, ajoutez ces variables d’environnement :
   - `STRIPE_SECRET_KEY`: votre clé secrète Stripe. Commencez avec une clé de test `sk_test_...`.
   - `SITE_URL`: l’URL HTTPS complète du site Netlify, sans slash final.
4. Déployez puis testez le paiement en mode test Stripe. Utilisez uniquement les cartes de test documentées par Stripe.
5. Avant de passer en mode réel, activez votre compte Stripe, vérifiez votre identité/entreprise et vos coordonnées bancaires, ajoutez la clé live dans les variables Netlify et effectuez vos propres vérifications de commande, livraison, remboursements et mentions légales.

## Sécurité et limites actuelles

- La clé secrète Stripe reste dans les variables d’environnement du serveur : ne la mettez jamais dans HTML, JavaScript du navigateur ou dans GitHub.
- Les prix sont calculés côté serveur à partir du catalogue autorisé, pas à partir des prix envoyés par le navigateur.
- Stripe Checkout héberge la page de paiement ; ce projet ne reçoit ni ne stocke les numéros de carte.
- Le formulaire transmet nom, téléphone, adresse et instructions de livraison à la fonction serveur, puis les inscrit dans les métadonnées de la session Stripe. Limitez l’accès à votre tableau de bord Stripe et publiez une politique de confidentialité adaptée.
- La fonction ne constitue pas encore un système complet de gestion de commandes ou de livreurs. Il faut ajouter un webhook Stripe vérifié et un stockage sécurisé pour suivre les paiements confirmés, gérer annulations/remboursements et coordonner les livraisons.
- Les plats et tarifs du site sont des exemples de démonstration. Vérifiez les prix, taxes, frais de livraison et disponibilité avant d’accepter des commandes réelles.
- Les options de paiement et pays autorisés dépendent de la configuration et de l’éligibilité de votre compte Stripe.

## Endpoint

La fonction est accessible à `/.netlify/functions/create-checkout-session`. Elle refuse les requêtes qui n’ont pas de panier/coordonnées valides et renvoie un lien Stripe Checkout.
