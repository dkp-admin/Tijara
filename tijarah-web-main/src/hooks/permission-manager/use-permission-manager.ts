import { useContext } from "react";
import { AuthContext } from "src/contexts/auth/jwt-context";
import { PermissionManagerBuilder } from "src/permissionManager";

/**
 *
 * @returns {{
 *   entityName: {
 *     read: boolean,
 *     create: boolean,
 *     update: boolean,
 *     // ...permissions
 *   }
 * }}
 * i.e.
 *
 * {
 *    product: {
 *      read: true,
 *      create: false,
 *      'send-receipt': true
 *    },
 *    order: {
 *      read: true,
 *      update: boolean
 *    }
 * }
 */

export function usePermissionManager() {
  const authContext = useContext(AuthContext);

  return PermissionManagerBuilder(authContext?.user);
}
