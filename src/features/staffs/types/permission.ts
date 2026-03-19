export interface Permission {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface PermissionGroup {
  id: string;
  title: string;
  permissions: Permission[];
}

export const MOCK_PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: "content",
    title: "Content Management",
    permissions: [
      {
        id: "content.create",
        name: "Create Content",
        description: "Allows creating new posts, articles, and media content.",
        enabled: true,
      },
      {
        id: "content.edit",
        name: "Edit Content",
        description: "Allows editing existing content created by any user.",
        enabled: true,
      },
      {
        id: "content.delete",
        name: "Delete Content",
        description: "Allows permanently deleting content from the platform.",
        enabled: false,
      },
      {
        id: "content.publish",
        name: "Publish Content",
        description: "Allows publishing draft content to make it publicly visible.",
        enabled: true,
      },
    ],
  },
  {
    id: "users",
    title: "User Management",
    permissions: [
      {
        id: "users.view",
        name: "View Users",
        description: "Allows viewing user profiles and account details.",
        enabled: true,
      },
      {
        id: "users.edit",
        name: "Edit Users",
        description: "Allows modifying user profiles and account settings.",
        enabled: false,
      },
      {
        id: "users.ban",
        name: "Ban Users",
        description: "Allows temporarily or permanently banning user accounts.",
        enabled: false,
      },
      {
        id: "users.resetPassword",
        name: "Reset User Password",
        description: "Allows initiating a password reset for any user account.",
        enabled: false,
      },
    ],
  },
  {
    id: "community",
    title: "Community & Moderation",
    permissions: [
      {
        id: "community.moderate",
        name: "Moderate Discussions",
        description: "Allows moderating chat rooms, forums, and community posts.",
        enabled: true,
      },
      {
        id: "community.manageRooms",
        name: "Manage Rooms",
        description: "Allows creating, editing, and archiving community rooms.",
        enabled: false,
      },
      {
        id: "community.manageEvents",
        name: "Manage Events",
        description: "Allows creating, scheduling, and cancelling community events.",
        enabled: false,
      },
    ],
  },
  {
    id: "system",
    title: "System & Settings",
    permissions: [
      {
        id: "system.viewLogs",
        name: "View Audit Logs",
        description: "Allows viewing system activity and audit trail logs.",
        enabled: false,
      },
      {
        id: "system.manageSettings",
        name: "Manage Settings",
        description: "Allows changing global system configuration and settings.",
        enabled: false,
      },
      {
        id: "system.manageRoles",
        name: "Manage Roles",
        description: "Allows creating and editing staff roles and permission sets.",
        enabled: false,
      },
    ],
  },
];
