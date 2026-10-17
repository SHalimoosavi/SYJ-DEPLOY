const R={viewer:1,developer:2,admin:3};function can(role,action){const n={read:1,deploy:2,manage:2,admin:3}[action]||99;return(R[role]||0)>=n}module.exports={R,can};
