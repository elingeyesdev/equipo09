-- This script creates a superadmin user to bootstrap the application.
-- The default password is "superadmin123".

DO $$
DECLARE
    v_user_id UUID;
    v_role_id UUID;
    v_password_hash VARCHAR := '$2b$12$R.S4wN.zC3d6eYhLZ5K0yevvT.3gTQd0T8jE9fW4jJ0x.y0Tq3Z2K'; -- superadmin123
BEGIN
    -- 1. Create the user
    INSERT INTO users (email, password_hash, email_verified, is_active, preferred_language)
    VALUES ('superadmin@equipo09.com', v_password_hash, true, true, 'es')
    RETURNING id INTO v_user_id;

    -- 2. Create the admin_profile pointing to this user
    INSERT INTO admin_profiles (user_id, first_name, last_name, employee_id, department, access_level, can_approve_campaigns, can_manage_users, can_manage_finances, is_active)
    VALUES (v_user_id, 'Super', 'Admin', 'EMP-0001', 'Board', 'super_admin', true, true, true, true);

    RAISE NOTICE 'SuperAdmin created successfully! Email: superadmin@equipo09.com, Password: Superadmin123';
END $$;
