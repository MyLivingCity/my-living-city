const { PrismaClient, SegmentType } = require('@prisma/client');
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

	const defaultSuperSegment = [{
		segId: 1,
		name: "CRD",
		country: "Canada",
		province: "British Columbia",
		SegmentType: "superSegment"
	}];

	const defaultSegments = [
		{ segId: 2, parentSegmentId: 1, country: 'Canada', province: 'British Columbia', name: 'Saanich', SegmentType: "segment" },
		{ segId: 3, parentSegmentId: 1, country: 'Canada', province: 'British Columbia', name: 'Oak bay', SegmentType: "segment" },
		{ segId: 4, parentSegmentId: 1, country: 'Canada', province: 'British Columbia', name: 'Langford', SegmentType: "segment" },
		{ segId: 5, parentSegmentId: 1, country: 'Canada', province: 'British Columbia', name: 'Mordor', SegmentType: "segment" },
		{ segId: 6, parentSegmentId: 1, country: 'Canada', province: 'British Columbia', name: 'Gondor', SegmentType: "segment" },
		{ segId: 7, parentSegmentId: 1, country: 'Canada', province: 'British Columbia', name: 'Minas tirith', SegmentType: "segment" },
		{ segId: 8, parentSegmentId: 1, country: 'Canada', province: 'British Columbia', name: 'Victoria', SegmentType: "segment" },
		{ segId: 9, parentSegmentId: 1, country: 'Canada', province: 'British Columbia', name: 'Esquimalt', SegmentType: "segment" }
	];

	const defaultSubSegments = [
		// Saanich
		{ segId: 10, parentSegmentId: 2, name: 'Camosun Interurban', lat: 0, lon: 0, SegmentType: "subSegment" },
		{ segId: 11, parentSegmentId: 2, name: 'UVIC', lat: 0, lon: 0, SegmentType: "subSegment" },
		{ segId: 12, parentSegmentId: 2, name: 'Uptown', lat: 0, lon: 0, SegmentType: "subSegment" },
		// Oak Bay
		{ segId: 13, parentSegmentId: 3, name: 'Cadboro Bay', lat: 0, lon: 0, SegmentType: "subSegment" },
		// Langford
		{ segId: 14, parentSegmentId: 4, name: 'Goldstream Station', lat: 0, lon: 0, SegmentType: "subSegment" },
		// Mordor
		{ segId: 15, parentSegmentId: 5, name: 'Orcburg', lat: 0, lon: 0, SegmentType: "subSegment" },
		{ segId: 16, parentSegmentId: 5, name: 'Doomview', lat: 0, lon: 0, SegmentType: "subSegment" },
		// Gondor
		{ segId: 17, parentSegmentId: 6, name: 'Whitewall', lat: 0, lon: 0, SegmentType: "subSegment" },
		// Minas Tirith
		{ segId: 18, parentSegmentId: 7, name: 'Riverside', lat: 0, lon: 0, SegmentType: "subSegment" },
		// Victoria
		{ segId: 19, parentSegmentId: 8, name: 'Downtown', lat: 0, lon: 0, SegmentType: "subSegment" },
		{ segId: 20, parentSegmentId: 8, name: 'Fairfield', lat: 0, lon: 0, SegmentType: "subSegment" },
		// Esquimalt
		{ segId: 21, parentSegmentId: 9, name: 'Westbay Village', lat: 0, lon: 0, SegmentType: "subSegment" },
		{ segId: 22, parentSegmentId: 9, name: 'Esquimalt Village', lat: 0, lon: 0, SegmentType: "subSegment" }
	];

	// Create categories
	const resolvedCategories = await Promise.all(
		defaultIdeaCategories.map(({ title, description }) => (
			prisma.category.upsert({
				where: { title },
				update: { title, description },
				create: { title, description }
			})
		))
	);

	// Create super segment
	const resolvedSuperSegment = await Promise.all(
		defaultSuperSegment.map((superSeg) => (
			prisma.segments.upsert({
				where: { segId: superSeg.segId },
				update: {
					name: superSeg.name,
					country: superSeg.country,
					province: superSeg.province
				},
				create: {
					segId: superSeg.segId,
					name: superSeg.name,
					country: superSeg.country,
					province: superSeg.province,
					segmentType: superSeg.SegmentType,
					parentId: null,
				}
			})
		))
	);

	// Create segments
	const resolvedSegments = await Promise.all(
		defaultSegments.map((segment) => (
			prisma.segments.upsert({
				where: { segId: segment.segId },
				update: {
					segId: segment.segId,
					country: segment.country,
					province: segment.province,
					name: segment.name
				},
				create: {
					segId: segment.segId,
					country: segment.country,
					province: segment.province,
					name: segment.name,
					segmentType: segment.SegmentType,
					parentId: segment.parentSegmentId,
				}
			})
		))
	);

	// Create subsegments
	const resolvedSubSegments = await Promise.all(
		defaultSubSegments.map((subSegment) => (
			prisma.segments.upsert({
				where: { segId: subSegment.segId },
				update: {
					segId: subSegment.segId,
					name: subSegment.name,
					lat: subSegment.lat,
					lon: subSegment.lon
				},
				create: {
					segId: subSegment.segId,
					name: subSegment.name,
					lat: subSegment.lat,
					lon: subSegment.lon,
					segmentType: subSegment.SegmentType,
					parentId: subSegment.parentSegmentId,
				}
			})
		))
	);

	// Create thresholds
	const thresholds = [
		{ id: 1, number: 3 },
		{ id: 2, number: 3 },
		{ id: 3, number: 3 },
		{ id: 4, number: 3 }
	];

	const resolvedThresholds = await Promise.all(
		thresholds.map((threshold) => (
			prisma.threshhold.upsert({
				where: { id: threshold.id },
				update: { number: threshold.number },
				create: { id: threshold.id, number: threshold.number }
			})
		))
	);

	console.log('Resolved populated Categories:', resolvedCategories);
	console.log('Resolved populated Super Segment:', resolvedSuperSegment);
	console.log('Resolved populated Segments:', resolvedSegments);
	console.log('Resolved populated Sub Segments:', resolvedSubSegments);
	console.log('Resolved populated Thresholds:', resolvedThresholds);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
