-- RenameIndex
ALTER INDEX "idea_address_idea_id_unique" RENAME TO "idea_address.idea_id_unique";

-- RenameIndex
ALTER INDEX "idea_geo_idea_id_unique" RENAME TO "idea_geo.idea_id_unique";

-- RenameIndex
ALTER INDEX "project_idea_id_unique" RENAME TO "project.idea_id_unique";

-- RenameIndex
ALTER INDEX "proposal_idea_id_unique" RENAME TO "proposal.idea_id_unique";

-- RenameIndex
ALTER INDEX "user_address_user_id_unique" RENAME TO "user_address.user_id_unique";

-- RenameIndex
ALTER INDEX "user_geo_user_id_unique" RENAME TO "user_geo.user_id_unique";

-- RenameIndex
ALTER INDEX "UserSegments_user_id_unique" RENAME TO "UserSegments.user_id_unique";
