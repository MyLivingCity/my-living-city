select 
	i.id, 
	i.author_id as "authorId",
	i.category_id as "categoryId",
	i.title,
	i.description,
	i.community_impact as "communityImpact",
	i.nature_impact as "natureImpact",
	i.arts_impact as "artsImpact",
	i.energy_impact as "energyImpact",
	i.manufacturing_impact as "manufacturingImpact",
	i.state,
	i.active,
	i.created_at,
	i.updated_at,
	count(ir.idea_id) as "ratingCount", 
	avg(ir.rating) as "ratingAvg"
from idea i 
left join idea_rating ir on i.id = ir.idea_id 
group by i.id
order by "ratingAvg" DESC;