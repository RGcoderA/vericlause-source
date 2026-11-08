insert into organizations (id, name)
values ('00000000-0000-0000-0000-000000000001', 'Northwind Procurement')
on conflict (id) do nothing;

insert into playbooks (id, org_id, version)
values ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 1)
on conflict (id) do nothing;

insert into playbook_rules (playbook_id, name, description, domain, severity, condition, keywords, patterns, enabled)
values
  (
    '00000000-0000-0000-0000-000000000011',
    'Liability capped at 12 months of fees',
    'We never accept unlimited liability. Vendor liability must be capped at fees paid in the prior 12 months.',
    'liability',
    'red',
    'liability_cap_months <= 12 and not unlimited',
    array['unlimited','liability','cap'],
    array['unlimited\\s+liability'],
    true
  ),
  (
    '00000000-0000-0000-0000-000000000011',
    'Auto-renewal requires 30 days notice',
    'Automatic renewal is only acceptable if we can opt out with at least 30 days written notice.',
    'payment',
    'red',
    'non_renewal_notice_days >= 30',
    array['automatically renews','fifteen'],
    array['automatically renews'],
    true
  );
