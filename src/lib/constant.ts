export const TOKEN_MAX_AGE_MINUTES = parseInt(process.env.JWT_EXPIRES_IN || "30");

export const userRole={
    TM :"Team Member",
    PM :"Project Manager",
    CEO :"Chief Executive Officer",
    TL :"Team Lead"
}
