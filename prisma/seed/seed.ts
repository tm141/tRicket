import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {

    //create roles 1 user 2 admin
    const role1 = await prisma.roles.create({
        data: {
            name: "user",
            description: "can login, browse event, see transaction history and buy ticket"
        },
    });
    console.log(role1);
    
    const role2 = await prisma.roles.create({
        data: {
            name: "admin",
            description: "can login, browse event, crud user, update transaction, crud organizer"
        },
    });
    console.log(role2);

    for (let i = 0; i < 50; i++) {
        // Hash the password
        let tempPassword = "password" + i
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(tempPassword, saltRounds);
        let password1 = hashedPassword;
        // Create a new user with random name and email
        const user = await prisma.users.create({
            data: {
                fName: "firstName" + i,
                lName: "lastName" + i,
                email: "email" + i,
                password: password1,
                referralCode: Buffer.from(`firstName${i}` + `email${i}`).toString('base64'),
                phone: "phone" + i,
                address: "address" + i,
                // Add other fields as needed
            },
        });

        const userRole = await prisma.usersRoles.create({
            data: {
                userId: user.id,
                roleId: 1,
            },
        });
        console.log(user);
        console.log(userRole);
    }
    const userRoleAdmin1 = await prisma.usersRoles.create({
        data: {
            userId: 1,
            roleId: 2,
        },
    });

    console.log(userRoleAdmin1);
    const userRoleAdmin2 = await prisma.usersRoles.create({
        data: {
            userId: 2,
            roleId: 2,
        },
    });

    console.log(userRoleAdmin2);

    for (let i = 0; i < 100; i++) {
        // Hash the password
        let tempPassword = "password"+i
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(tempPassword, saltRounds);
        let password1 = hashedPassword;

        const organizer = await prisma.organizers.create({
            data: {
                name: "organizerName" + i,
                email: "organizerEmail" + i,
                password: password1,
                phone: "organizerPhone" + i,
                address: "organizerAddress" + i,
                // Add other fields as needed
            },
        });
        console.log(organizer);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });