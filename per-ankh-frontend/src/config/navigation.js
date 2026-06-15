import { FiBarChart2, FiZap, FiSettings, FiLayout } from "react-icons/fi";

export const NAV_ITEMS = [
  { path: "/boards", label: "Tableaux", icon: FiLayout },
  { path: "/search", label: "Analytique", icon: FiBarChart2 },
  { path: "/notifications", label: "Activité", icon: FiZap },
];

export const FOOTER_NAV = [
  { path: "/settings", label: "Paramètres", icon: FiSettings },
];


export const BOARD_TABS = [
  { id: "list", label: "Liste", path: "list" },
  { id: "board", label: "Tableau", path: "" },
  { id: "timeline", label: "Chronologie", path: "timeline" },
  { id: "calendar", label: "Calendrier", path: "calendar" },
  { id: "progress", label: "Progression", path: "progress" },
  { id: "members", label: "Membres", path: "members" },
];

export const ROUTE_META = {
  "/boards": {
    title: "Mes projets",
    section: "PER-ANKH",
    description: "Choisissez un projet ou créez-en un nouveau.",
  },
  "/notifications": {
    title: "Notifications",
    section: "Compte",
    description: "Assignations, mentions et changements de statut.",
  },
  "/settings": {
    title: "Paramètres",
    section: "Compte",
    description: "Profil et configuration.",
  },
  "/search": {
    title: "Recherche",
    section: "Board",
    description: "Trouver des tâches dans vos projets.",
  },
};

export const getRouteMeta = (pathname) => {
  if (pathname.startsWith("/board/")) {
    return {
      title: "Projet",
      section: "Gestion de projet",
      description: "Kanban, liste et collaboration.",
    };
  }
  return (
    ROUTE_META[pathname] || {
      title: "PER-ANKH",
      section: "Collaboration",
      description: "Plateforme collaborative temps réel.",
    }
  );
};
