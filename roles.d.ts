// mrt add roles

declare module Roles {
  function addUsersToRoles(userId: string, roleNames: string[]): void;
  function userIsInRole(userId: string, roleNames: string[]): boolean;
}