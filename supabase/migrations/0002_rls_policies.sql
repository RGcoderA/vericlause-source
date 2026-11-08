alter table organizations enable row level security;
alter table profiles enable row level security;
alter table playbooks enable row level security;
alter table playbook_rules enable row level security;
alter table contracts enable row level security;
alter table reviews enable row level security;
alter table findings enable row level security;

create policy "profiles are readable by owner"
  on profiles for select
  using (id = auth.uid());

create policy "org members read org"
  on organizations for select
  using (id in (select org_id from profiles where id = auth.uid()));

create policy "org members read playbooks"
  on playbooks for select
  using (org_id in (select org_id from profiles where id = auth.uid()));

create policy "org members write playbooks"
  on playbooks for all
  using (org_id in (select org_id from profiles where id = auth.uid()));

create policy "org members read rules"
  on playbook_rules for select
  using (
    playbook_id in (
      select id from playbooks
      where org_id in (select org_id from profiles where id = auth.uid())
    )
  );

create policy "org members write rules"
  on playbook_rules for all
  using (
    playbook_id in (
      select id from playbooks
      where org_id in (select org_id from profiles where id = auth.uid())
    )
  );

create policy "org members read contracts"
  on contracts for select
  using (org_id in (select org_id from profiles where id = auth.uid()));

create policy "org members write contracts"
  on contracts for all
  using (org_id in (select org_id from profiles where id = auth.uid()));

create policy "org members read reviews"
  on reviews for select
  using (org_id in (select org_id from profiles where id = auth.uid()));

create policy "org members write reviews"
  on reviews for all
  using (org_id in (select org_id from profiles where id = auth.uid()));

create policy "org members read findings"
  on findings for select
  using (
    review_id in (
      select id from reviews
      where org_id in (select org_id from profiles where id = auth.uid())
    )
  );

create policy "org members write findings"
  on findings for all
  using (
    review_id in (
      select id from reviews
      where org_id in (select org_id from profiles where id = auth.uid())
    )
  );
