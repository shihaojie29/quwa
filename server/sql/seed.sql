INSERT INTO users (id, openid, nickname, avatar_url)
VALUES ('demo-user', NULL, 'Demo User', NULL)
ON DUPLICATE KEY UPDATE nickname = VALUES(nickname);

INSERT INTO trips (id, owner_user_id, name, destination, start_date, end_date, budget, status)
VALUES ('trip-osaka-kyoto-2026', 'demo-user', '大阪·京都 6日游', 'OSAKA', '2026-05-20', '2026-05-25', 6800, 'planning')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  destination = VALUES(destination),
  start_date = VALUES(start_date),
  end_date = VALUES(end_date),
  budget = VALUES(budget),
  status = VALUES(status);

INSERT INTO trip_members (id, trip_id, name, initial, color, sort_order)
VALUES
  ('member-xiaoyu', 'trip-osaka-kyoto-2026', '小鱼', '鱼', '#F07A5A', 1),
  ('member-acheng', 'trip-osaka-kyoto-2026', '阿橙', '橙', '#FFB84D', 2)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  initial = VALUES(initial),
  color = VALUES(color),
  sort_order = VALUES(sort_order);

INSERT INTO trip_reminders (id, trip_id, title, note, pinned, remind_at)
VALUES ('reminder-pinned-1', 'trip-osaka-kyoto-2026', '居酒屋预约', '5月21日 19:00 · 2位，出发前再确认一次。', TRUE, '2026-05-19')
ON DUPLICATE KEY UPDATE title = VALUES(title), note = VALUES(note), pinned = VALUES(pinned), remind_at = VALUES(remind_at);

INSERT INTO itinerary_days (trip_id, date, label)
VALUES
  ('trip-osaka-kyoto-2026', '2026-05-20', '第1天'),
  ('trip-osaka-kyoto-2026', '2026-05-21', '第2天'),
  ('trip-osaka-kyoto-2026', '2026-05-22', '第3天'),
  ('trip-osaka-kyoto-2026', '2026-05-23', '第4天'),
  ('trip-osaka-kyoto-2026', '2026-05-24', '第5天'),
  ('trip-osaka-kyoto-2026', '2026-05-25', '第6天')
ON DUPLICATE KEY UPDATE label = VALUES(label);

INSERT INTO itinerary_items (id, trip_id, date, kind, title, time, time_end, from_place, to_place, location, note, sort_order)
VALUES
  ('item-flight-1', 'trip-osaka-kyoto-2026', '2026-05-20', 'transport', 'JL789 飞大阪', '08:50', '10:30', '上海浦东 PVG', '关西机场 KIX', NULL, '经济舱 · 约2h40m', 1),
  ('item-activity-2', 'trip-osaka-kyoto-2026', '2026-05-21', 'activity', '大阪城公园', '10:00', NULL, NULL, NULL, '大阪', '天守阁和公园慢慢逛。', 1)
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  time = VALUES(time),
  time_end = VALUES(time_end),
  from_place = VALUES(from_place),
  to_place = VALUES(to_place),
  location = VALUES(location),
  note = VALUES(note),
  sort_order = VALUES(sort_order);

INSERT INTO expenses (id, trip_id, title, category, amount, expense_date, paid_by_member_id, is_aa, note)
VALUES
  ('expense-transport-1', 'trip-osaka-kyoto-2026', '机票定金', '交通', 320, '2026-05-20', 'member-xiaoyu', TRUE, NULL),
  ('expense-hotel-1', 'trip-osaka-kyoto-2026', '酒店 6 晚', '住宿', 2400, '2026-05-20', 'member-acheng', TRUE, NULL)
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  category = VALUES(category),
  amount = VALUES(amount),
  expense_date = VALUES(expense_date),
  paid_by_member_id = VALUES(paid_by_member_id),
  is_aa = VALUES(is_aa),
  note = VALUES(note);

INSERT INTO notes (id, trip_id, title, content, pinned, created_at_text, updated_at_text)
VALUES ('note-1', 'trip-osaka-kyoto-2026', '行前提醒', '确认护照、机票和酒店订单。', TRUE, '2026-05-01T08:00:00.000Z', '2026-05-01T08:00:00.000Z')
ON DUPLICATE KEY UPDATE title = VALUES(title), content = VALUES(content), pinned = VALUES(pinned), updated_at_text = VALUES(updated_at_text);

INSERT INTO checklist_items (id, trip_id, title, category, done, note, sort_order)
VALUES
  ('checklist-id-1', 'trip-osaka-kyoto-2026', '护照', '证件证卡', FALSE, NULL, 1),
  ('checklist-electronic-1', 'trip-osaka-kyoto-2026', '充电器', '电子', FALSE, NULL, 2)
ON DUPLICATE KEY UPDATE title = VALUES(title), category = VALUES(category), done = VALUES(done), note = VALUES(note), sort_order = VALUES(sort_order);

