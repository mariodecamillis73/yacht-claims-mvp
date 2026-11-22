UPDATE "Claim" SET status = 'closed', updatedAt = CURRENT_TIMESTAMP
WHERE status <> 'closed' AND id IN (
  SELECT claimId FROM "ActivityLog"
  WHERE entityType = 'claim' AND action = 'Imported from YES'
  AND trim(replace(json_extract(details, '$.index.cells[9]'), '%', '')) IN ('100','100.0','100.00','100,0','100,00')
);
