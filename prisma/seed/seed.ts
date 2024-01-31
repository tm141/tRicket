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

    //create user
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

    //make user1 and user2 admin
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

    //create organizer
    for (let i = 0; i < 50; i++) {
        // Hash the password
        let tempPassword = "password" + i
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

    const idIsPaidEvent: number[] = [];
    //create event
    for (let i = 0; i < 150; i++) {
        const organizerId = Math.floor(Math.random() * 50) + 1;
        const randShowTime = new Date(new Date(2023, 0, 1).getTime() + Math.random() * (new Date(2027, 0, 1).getTime() - new Date(2023, 0, 1).getTime()));
        const randIsPaidEvent = Math.random() < 0.5;
        const event = await prisma.events.create({
            data: {
                organizersId: organizerId,
                name: "eventName" + i,
                description: "eventDescription" + i + " lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla euismod, nisl vitae aliquam ultricies, nunc nisl aliquet nunc, vitae aliquam nis",
                showTime: randShowTime,
                location: "eventLocation" + i,
                isPaidEvent: Math.random() < 0.5,
                bannerPicture: "eventBannerPicture" + i,

            },
        });
        if (randIsPaidEvent) idIsPaidEvent.push(event.id);
        console.log(event);
    }

    //create ticket
    for (let i = 0; i < 150; i++) {
        const randAmount = Math.floor(Math.random() * 100) + 1;

        //create free ticket for free event
        if (!idIsPaidEvent.includes(i + 1)) {
            const ticket = await prisma.tickets.create({
                data: {
                    eventId: i + 1,
                    name: "freeTicketName" + i,
                    price: 0,
                    description: "freeTicketDescription" + i,
                    amount: randAmount,
                },
            });
            continue;
        }

        //create paid ticket for paid event
        const ticketCount = Math.floor(Math.random() * 10) + 1;
        for (let j = 0; j < ticketCount; j++) {
            const eventId = i + 1;
            const randAmount1 = Math.floor(Math.random() * 100) + 1;
            const ticket = await prisma.tickets.create({
                data: {
                    eventId: eventId,
                    name: "ticketName" + i + j,
                    price: Math.floor(Math.random() * 1000000) + 1,
                    description: "ticketDescription" + i + j,
                    amount: randAmount1,
                },
            });
            console.log(ticket);
        }
    }

    //create promosDate
    for (let i = 0; i < 150; i++) {
        if (!idIsPaidEvent.includes(i + 1)) continue;

        const randDiscount = Math.floor(Math.random() * 99) + 1;
        const randStartDate = new Date(Math.random() * (new Date(2027, 0, 1).getTime() - new Date(2023, 0, 1).getTime()));
        const randEndDate = new Date(Math.random() * (new Date(2027, 0, 1).getTime() - new Date(2023, 0, 1).getTime()));
        const promoDate = await prisma.promosDate.create({
            data: {
                eventId: i + 1,
                name: "promoDateName" + i,
                description: "promoDateDescription" + i,
                discount: randDiscount,
                startDate: randStartDate,
                endDate: randEndDate,
            },
        });
        console.log(promoDate);
    }

    //create promoReferral
    for (let i = 0; i < 150; i++) {
        if (!idIsPaidEvent.includes(i + 1)) continue;

        const randAmount = Math.floor(Math.random() * 100) + 1;
        const randDiscount = Math.floor(Math.random() * 99) + 1;
        const promoReferral = await prisma.promosReferral.create({
            data: {
                eventId: i + 1,
                name: "promoReferralName" + i,
                description: "promoReferralDescription" + i,
                discount: randDiscount,
                amount: randAmount,
            },
        });
        console.log(promoReferral);
    }

    // create paymentType
    const paymentType1 = await prisma.paymentTypes.create({
        data: {
            name: "Cash",
            description: "Pay cash at indomaret or alfamart",
        },
    });
    console.log(paymentType1);

    const paymentType2 = await prisma.paymentTypes.create({
        data: {
            name: "Gopay",
            description: "Pay with Gopay",
        },
    });
    console.log(paymentType2);

    const paymentType3 = await prisma.paymentTypes.create({
        data: {
            name: "Ovo",
            description: "Pay with Ovo",
        },
    });
    console.log(paymentType3);

    const paymentType4 = await prisma.paymentTypes.create({
        data: {
            name: "Credit Card",
            description: "Pay with Credit Card",
        },
    });
    console.log(paymentType4);

    const paymentType5 = await prisma.paymentTypes.create({
        data: {
            name: "Transfer",
            description: "Pay with Transfer",
        },
    });
    console.log(paymentType5);

    //create transaction
    for (let i = 0; i < 100; i++) {
        const randUserId = Math.floor(Math.random() * 50) + 1;
        const randPaymentTypeId = Math.floor(Math.random() * 5) + 1;
        // const randTotalPrice = Math.floor(Math.random() * 1000000) + 1;
        const randPaymentStatus = Math.random() < 0.5;

        const transaction = await prisma.transactions.create({
            data: {
                userId: randUserId,
                paymentTypeId: randPaymentTypeId,
                // total: randTotalPrice,
                total:0,
                status: randPaymentStatus,
            },
        });
        console.log(transaction);

        let tempTransactionTotal = 0;
        //create transaction/ticket
        const randEventAmount = Math.floor(Math.random() * 3) + 1;
        for (let j = 0; j < randEventAmount; j++) {
            const randEventId = Math.floor(Math.random() * 150) + 1;
            const tickets = await prisma.tickets.findMany({
                where: {
                    eventId: randEventId,
                },
            });
            const promoDates = await prisma.promosDate.findMany({
                where: {
                    eventId: randEventId,
                },
            });
            const promoReferrals = await prisma.promosReferral.findMany({
                where: {
                    eventId: randEventId,
                },
            });

            const randTicketId = Math.floor(Math.random() * tickets.length);
            const randTicketAmount = Math.floor(Math.random() * 10) + 1;
            let usePromoDate = false;
            let usePromoReferral = false;
            let promoDateId = -1;
            let promoReferralId = -1;

            if (promoDates.length > 0) usePromoDate = Math.random() < 0.5;
            if (promoReferrals.length > 0) usePromoReferral = Math.random() < 0.5;

            if (usePromoDate) {
                promoDateId = promoDates[Math.floor(Math.random() * promoDates.length)].id;
            }

            if (usePromoReferral) {
                promoReferralId = promoReferrals[Math.floor(Math.random() * promoReferrals.length)].id;
            }

            const promoDateIdFinal = promoDateId === -1 ? null : promoDateId;
            const promoReferralIdFinal = promoReferralId === -1 ? null : promoReferralId;


            let total = parseFloat(tickets[randTicketId].price.toString()) * randTicketAmount;

            let promoDateAmount = 0;
            let promoReferralAmount = 0;

            let promoDateDiscount = 0;
            let promoReferralDiscount = 0;
            if (promoDateIdFinal){
                const tempPromo = await prisma.promosDate.findUnique({
                    where: {
                        id: promoDateIdFinal,
                    },
                });
                promoDateDiscount = tempPromo?tempPromo.discount:0;
            }

            if (promoReferralIdFinal){
                const tempPromo = await prisma.promosReferral.findUnique({
                    where: {
                        id: promoReferralIdFinal,
                    },
                });
                promoReferralDiscount = tempPromo?tempPromo.discount:0;
            }

            if (usePromoDate && promoDateIdFinal) promoDateAmount = total * (parseFloat(promoDateDiscount.toString()) / 100);
            if (usePromoReferral && promoReferralIdFinal) promoReferralAmount = total * (parseFloat(promoReferralDiscount.toString())/100);

            total = total-promoDateAmount-promoReferralAmount;

            const transactionTicket = await prisma.transactionsTickets.create({
                data: {
                    transactionId: transaction.id,
                    ticketId: tickets[randTicketId].id,
                    amount: randTicketAmount,
                    promosDateId: promoDateIdFinal,
                    promosReferralId: promoReferralIdFinal,
                    total: total,
                },
            });
            console.log(transactionTicket);
            tempTransactionTotal += total;
            if(tempTransactionTotal<0) tempTransactionTotal=0;
        }

        const updateTransaction = await prisma.transactions.update({
            where: {
                id: transaction.id,
            },
            data: {
                total: tempTransactionTotal,
            },
        });
    }

    //create feedback
    for (let i = 0; i < 100; i++) {
        const randUserId = Math.floor(Math.random() * 50) + 1;
        const randEventId = Math.floor(Math.random() * 150) + 1;
        const randRating = Math.floor(Math.random() * 5) + 1;
        const randComment = "feedbackComment" + i;

        const feedback = await prisma.feedbacks.create({
            data: {
                userId: randUserId,
                eventId: randEventId,
                Rating: randRating,
                message: randComment,
            },
        });
        console.log(feedback);
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