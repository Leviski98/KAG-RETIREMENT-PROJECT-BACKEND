export const MESSAGES = {
  CHURCH: {
    ADD_SUCCESS: "Church added successfully.",
    EDIT_SUCCESS: "Church updated successfully.",
    DELETE_SUCCESS: "Church deleted successfully.",
    DELETE_CONFIRM_TITLE: "Delete Church?",
    DELETE_CONFIRM_DESCRIPTION: (name: string) =>
      `Are you sure you want to delete ${name}? This action cannot be undone and will affect all pastor assignments for this church.`,
  },
  ROLE: {
    ADD_SUCCESS: "Role added successfully.",
    EDIT_SUCCESS: "Role updated successfully.",
    DELETE_SUCCESS: "Role deleted successfully.",
    DELETE_CONFIRM_TITLE: "Delete Role?",
    DELETE_CONFIRM_DESCRIPTION: (name: string) =>
      `Are you sure you want to delete ${name}? This action cannot be undone and may affect existing assignments.`,
  },
  ASSIGNMENT: {
    ADD_SUCCESS: "Assignment added successfully.",
    DELETE_SUCCESS: "Assignment deleted successfully.",
    DELETE_CONFIRM_TITLE: "Delete Assignment?",
    DELETE_CONFIRM_DESCRIPTION: (pastor: string, church: string) =>
      `Are you sure you want to delete ${pastor} \u2192 ${church}? This will remove the pastor from this church role.`,
  },
  EMPTY: {
    CHURCHES: "No churches found",
    CHURCHES_DESCRIPTION: "Try adjusting your filters or add a new church.",
    ROLES: "No roles defined",
    ROLES_DESCRIPTION: "Add a role to get started.",
    ASSIGNMENTS: "No assignments found",
    ASSIGNMENTS_DESCRIPTION: "Try adjusting your filters or add a new assignment.",
  },
} as const;
