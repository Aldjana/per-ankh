DOCUMENTATION TECHNIQUE DU PROJET PER ANKH

1. Présentation du projet
•	PER ANKH est une plateforme collaborative permettant aux utilisateurs de gérer des tâches sous forme de tableau Kanban, créer des espaces de travail, collaborer en temps réel, recevoir des notifications et partager des fichiers.
2. Architecture du projet
•	Architecture : Frontend React + Vite → Backend Node.js + Express → Supabase (PostgreSQL, Auth, Storage et Realtime).
3. Choix techniques
•	React + Vite : interface moderne, composants réutilisables et développement rapide.
•	Node.js + Express : API REST légère et performante.
•	Supabase : PostgreSQL, authentification, stockage et temps réel intégrés.
4. Modèle de données
•	Tables principales : profiles, workspaces, boards, columns et tasks.
5. Procédure d’installation
•	Installer Node.js, npm, Git et VS Code.
•	Configurer les variables d’environnement du frontend et du backend.
•	Installer les dépendances avec npm install.	
6. Guide de lancement
•	Backend : npm run dev (http://localhost:5000)
•	Frontend : npm run dev (http://localhost:5173)
7. Description des fonctionnalités
•	Authentification : inscription, connexion, déconnexion, sessions et réinitialisation du mot de passe.
•	Espaces de travail : création, modification et suppression.
•	Kanban : colonnes, tâches et Drag & Drop.
•	Notifications et gestion des fichiers.
