const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
	console.log("hello from seed")
	const defaultIdeaCategories = [
		{ title: 'policy', description: '' },
		{ title: 'event', description: '' },
		{ title: 'municipal infrastructure', description: '' },
		{ title: 'park infrastructure', description: '' },
		{ title: 'private infrastructure', description: '' },
		{ title: 'service', description: '' },
		{ title: 'product', description: '' },
		{ title: 'other', description: '' },
	];

	/* const defaultUserRoles = [
		'resident', //Basic user account
		'guest', //Here for later implementation
		'associate', //Here for later implementation
		'worker', //Work location
		'business', //For business accounts
		'municipal' //For city/municipal accounts
	]; */


	const defaultSuperSegment = [{
		superSegId:1,
		name:"CRD",
		country: "Canada",
		province: "BC"
	}];

	const defaultSegments = [
		{segId:1,superSegId:1,country: 'canada', province: 'british columbia', name: 'victoria', superSegName: 'crd'},
		{segId:2,superSegId:1,country: 'canada', province: 'british columbia', name: 'saanich', superSegName: 'crd'},
		{segId:3,superSegId:1,country: 'canada', province: 'british columbia', name: 'esquimalt', superSegName: 'crd'},
	];

	const defaultSubSegments = [
		//victoria
		{id:1,segId:1,name:'fairfield', lat: 0, lon: 0},
		//saanich
		{id:2,segId:2,name:'rutledge park', lat: 0, lon: 0},
		//esquimalt
		{id:3,segId:3,name:'saxe point', lat: 0, lon: 0},

	];

	const resolvedCategories = await Promise.all(
		defaultIdeaCategories.map(({ title, description }) => (
			prisma.category.upsert({
				where: {
					title
				},
				update: {
					title,
					description,
				},
				create: {
					title,
					description,
				}
			})
		))
	);

	/* const resolvedUserRoles = await Promise.all(
		defaultUserRoles.map((role) => (
			prisma.userRole.upsert({
				where: {
					name: role
				},
				update: {
					name: role
				},
				create: {
					name: role
				}
			})
    ))
	); */

	const createSuperSegment = await prisma.superSegment.upsert({
			where:{
				superSegId:defaultSuperSegment[0].superSegId
			},
			update:{
				superSegId:defaultSuperSegment[0].superSegId,
				name:defaultSuperSegment[0].name,
				country:defaultSuperSegment[0].country,
				province:defaultSuperSegment[0].province
			},
			create:{
				name:defaultSuperSegment[0].name,
				country:defaultSuperSegment[0].country,
				province:defaultSuperSegment[0].province
			}
	});

	const victoriaSegment = await prisma.segments.upsert({
		where:{segId:defaultSegments[0].segId},
		update:{
			superSegId:defaultSegments[0].superSegId,
			country:defaultSegments[0].country,
			province:defaultSegments[0].province,
			name:defaultSegments[0].name,
			superSegName:defaultSegments[0].superSegName
		},
		create:{
			superSegId:defaultSegments[0].superSegId,
			country:defaultSegments[0].country,
			province:defaultSegments[0].province,
			name:defaultSegments[0].name,
			superSegName:defaultSegments[0].superSegName
		}
	});

	const sannichSegment = await prisma.segments.upsert({
		where:{segId:defaultSegments[1].segId},
		update:{
			superSegId:defaultSegments[1].superSegId,
			country:defaultSegments[1].country,
			province:defaultSegments[1].province,
			name:defaultSegments[1].name,
			superSegName:defaultSegments[1].superSegName
		},
		create:{
			superSegId:defaultSegments[1].superSegId,
			country:defaultSegments[1].country,
			province:defaultSegments[1].province,
			name:defaultSegments[1].name,
			superSegName:defaultSegments[1].superSegName
		}
	});

	const esquimaltSegment = await prisma.segments.upsert({
		where:{segId:defaultSegments[2].segId},
		update:{
			superSegId:defaultSegments[2].superSegId,
			country:defaultSegments[2].country,
			province:defaultSegments[2].province,
			name:defaultSegments[2].name,
			superSegName:defaultSegments[2].superSegName
		},
		create:{
			superSegId:defaultSegments[2].superSegId,
			country:defaultSegments[2].country,
			province:defaultSegments[2].province,
			name:defaultSegments[2].name,
			superSegName:defaultSegments[2].superSegName
		}
	});

	const fairfieldSubSegment = await prisma.subSegments.upsert({
		where:{id:defaultSubSegments[0].id},
		update:{
			segId:victoriaSegment.segId,
			name:defaultSubSegments[0].name,
			lat:defaultSubSegments[0].lat,
			lon:defaultSubSegments[0].lon
		},
		create:{
			segId:victoriaSegment.segId,
			name:defaultSubSegments[0].name,
			lat:defaultSubSegments[0].lat,
			lon:defaultSubSegments[0].lon
		}
	});

	const rutledge_parkSubSegment = await prisma.subSegments.upsert({
		where:{id:defaultSubSegments[1].id},
		update:{
			segId:sannichSegment.segId,
			name:defaultSubSegments[1].name,
			lat:defaultSubSegments[1].lat,
			lon:defaultSubSegments[1].lon
		},
		create:{
			segId:sannichSegment.segId,
			name:defaultSubSegments[1].name,
			lat:defaultSubSegments[1].lat,
			lon:defaultSubSegments[1].lon
		}
	});

	const saxe_pointSubSegment = await prisma.subSegments.upsert({
		where:{id:defaultSubSegments[2].id},
		update:{
			segId:esquimaltSegment.segId,
			name:defaultSubSegments[2].name,
			lat:defaultSubSegments[2].lat,
			lon:defaultSubSegments[2].lon
		},
		create:{
			segId:esquimaltSegment.segId,
			name:defaultSubSegments[2].name,
			lat:defaultSubSegments[2].lat,
			lon:defaultSubSegments[2].lon
		}
	});

	const defaultThreshold = await prisma.threshhold.upsert({
		where: {id: 1},
		update: {
			id: 1,
			number: 3
		},
		create: {
			id: 1,
			number: 3
		}
	});

	const falseFlaggingThreshold = await prisma.threshhold.upsert({
		where: {id: 2},
		update: {
			id: 2,
			number: 3
		},
		create: {
			id: 2,
			number: 3
		}
	});

	const badPostingThreshold = await prisma.threshhold.upsert({
		where: {id: 3},
		update: {
			id: 3,
			number: 3
		},
		create: {
			id: 3,
			number: 3
		}
	});

	const postFlaggingThreshold = await prisma.threshhold.upsert({
		where: {id: 4},
		update: {
			id: 4,
			number: 3
		},
		create: {
			id: 4,
			number: 3
		}
	});


	console.log('Resolved populated Categories', resolvedCategories);
	//console.log('Resolved populated UserRoles', resolvedUserRoles);
	console.log('Resolved populated Super Segment', createSuperSegment);
	console.log('Resolved populated segments', victoriaSegment);
	console.log('Resolved populated segments', sannichSegment);
	console.log('Resolved populated segments', esquimaltSegment);
	console.log('Resolved populated sub segments', fairfieldSubSegment);
	console.log('Resolved populated sub segments', rutledge_parkSubSegment);
	console.log('Resolved populated sub segments', saxe_pointSubSegment);
	console.log('Resolved populating threshold', defaultThreshold);
	console.log('Resolved populating false flagging threshold', falseFlaggingThreshold);
	console.log('Resolved populating bad posting threshold', badPostingThreshold);
	console.log('Resolved populating post flagging threshold', postFlaggingThreshold);
}

main()
	.then(() => console.log('Hello from seed.js'))
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
