const ROLES = {
    ADMIN: 'admin',
    USER: 'user'
}

const PATHS = {
    MANAGE_USERS: {
        id: 1,
        text: 'users',
        link: '/users',  // relative
        roles: [ROLES.ADMIN]
    },
    MANAGE_CAMERAS: {
        id: 2,
        text: 'cameras',
        link: '/cameras',
        roles: [ROLES.ADMIN]
    },
    SETTINGS: {
        id: 3,
        text: 'settings',
        link: '/settings',
        roles: [ROLES.ADMIN, ROLES.USER]
    }
}

/*
{
  admin: [{'users', '/users'},{'cameras', '/cameras'},{'settings', '/'}],
  user: [{'settings', '/'}]
}
*/
const ROLE_PATHS = Object.entries(PATHS).reduce(
    (acc, [pathName, { id, text, link, roles }]) => {
        roles.forEach((role) => {
            if (!acc[role]) {
                acc[role] = []
            }
            acc[role].push({ id, text, link })
        });
        return acc
    },
    {}
);

export { ROLES, PATHS, ROLE_PATHS }