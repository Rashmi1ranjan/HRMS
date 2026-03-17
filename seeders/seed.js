require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const db = require("../config/db");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

const cities = [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai",
    "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Surat",
];

const indianNames = [
    "Aarav Sharma", "Vivaan Patel", "Aditya Verma", "Vihaan Singh", "Arjun Gupta",
    "Sai Mehta", "Reyansh Rao", "Ayaan Khan", "Krishna Joshi", "Ishaan Malhotra",
    "Ananya Sharma", "Diya Patel", "Priya Nair", "Meera Iyer", "Kavya Reddy",
    "Riya Gupta", "Sneha Joshi", "Pooja Mehta", "Tanvi Singh", "Shruti Verma",
    "Rohan Das", "Karan Kapoor", "Nikhil Yadav", "Amit Tiwari", "Suresh Bhat",
    "Ramesh Pillai", "Dinesh Naidu", "Mahesh Kulkarni", "Rakesh Pandey", "Sunil Mishra",
    "Deepika Sharma", "Asha Nair", "Sunita Patel", "Rekha Verma", "Neha Gupta",
    "Geeta Joshi", "Usha Mehta", "Lata Singh", "Manju Rao", "Sonal Das",
    "Harsh Agarwal", "Varun Soni", "Rahul Saxena", "Tejas Bhatt", "Kunal Shah",
    "Mohit Bansal", "Gaurav Gill", "Ajay Thakur", "Vijay Bose", "Manish Nambiar",
];

async function seed() {
    const connection = await db.getConnection();

    try {
        console.log("🌱  Starting seeder...\n");

        // Disable foreign key checks to allow truncation
        await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
        await connection.execute('TRUNCATE TABLE users');
        await connection.execute('TRUNCATE TABLE roles');
        await connection.execute('TRUNCATE TABLE designations');
        await connection.execute('TRUNCATE TABLE departments');
        await connection.execute('TRUNCATE TABLE companies');
        await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
        console.log("  Tables truncated.\n");

        for (let i = 1; i <= 50; i++) {
            const city = cities[(i - 1) % cities.length];
            const companyEmail = `company${i}@hrms.com`;
            const companyPassword = await bcrypt.hash(`Password@${i}`, SALT_ROUNDS);

            // ── 1. Insert Company ──────────────────────────────────────────────
            const [companyResult] = await connection.execute(
                `INSERT INTO companies 
           (name, alias, address, email, password, city, pincode, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    `HRMS Company ${i}`,
                    `HRMS${i}`,
                    `${i} Business Park, ${city}`,
                    companyEmail,
                    companyPassword,
                    city,
                    `${400000 + i}`,
                    true,
                ]
            );

            const company_id = companyResult.insertId;

            // ── 2. Create superadmin role for this company ─────────────────────
            const [roleResult] = await connection.execute(
                `INSERT INTO roles (role_name, company_id, status)
         VALUES (?, ?, ?)`,
                ["superadmin", company_id, true]
            );

            const role_id = roleResult.insertId;

            // ── 3. Create Departments and Designations ────────────────────────
            const departments = ["HR", "IT", "Sales", "Marketing"];
            const designationsMap = {
                "HR": ["HR Manager", "Recruiter"],
                "IT": ["IT Manager", "Developer", "Tester"],
                "Sales": ["Sales Manager", "Sales Executive"],
                "Marketing": ["Marketing Head", "SEO Specialist"]
            };

            const deptIds = [];
            const desigIds = [];

            for (const deptName of departments) {
                const [deptResult] = await connection.execute(
                    `INSERT INTO departments (name, company_id) VALUES (?, ?)`,
                    [deptName, company_id]
                );
                const deptId = deptResult.insertId;
                deptIds.push(deptId);

                for (const desigName of designationsMap[deptName]) {
                    const [desigResult] = await connection.execute(
                        `INSERT INTO designations (name, department_id) VALUES (?, ?)`,
                        [desigName, deptId]
                    );
                    desigIds.push(desigResult.insertId);
                }
            }

            // ── 4. Insert one User for this company ────────────────────────────
            const userEmail = `user${i}@hrms.com`;
            const userPassword = await bcrypt.hash(`UserPass@${i}`, SALT_ROUNDS);
            const randomDesignationId = desigIds[Math.floor(Math.random() * desigIds.length)];

            await connection.execute(
                `INSERT INTO users
           (company_id, role_id, designation_id, name, email, password, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    company_id,
                    role_id,
                    randomDesignationId,
                    indianNames[(i - 1) % indianNames.length],
                    userEmail,
                    userPassword,
                    true,
                ]
            );

            console.log(
                `  ✅  [${String(i).padStart(2, "0")}/50]  Company: ${companyEmail}  |  User: ${userEmail}`
            );
        }

        console.log("\n  Seeding complete!  50 companies, departments, designations and users inserted.\n");
    } catch (err) {
        console.error("  Seeder failed:", err.message);
        throw err;
    } finally {
        connection.release();
        process.exit(0);
    }
}

seed();
