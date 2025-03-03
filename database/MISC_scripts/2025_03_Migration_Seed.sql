-- MODIFIED INSERT STATEMENTS FROM DUMP FILE FOR 2025/03 DEV DB, TO BE IMPLEMENTED IN SEED SCRIPT

BEGIN;

-- TOC entry 3521 (class 0 OID 362000)
-- Dependencies: 205
-- Data for Name: category; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.category VALUES (10, 'Public Infrastructure', 'Suggestions for improving community facilities like roads or public spaces.', '2024-12-27 15:11:30.701', '2024-12-27 15:11:30.701');
INSERT INTO public.category VALUES (19, 'Park Infrastructure', 'Suggestions for improving community park environments.', '2025-01-16 17:20:08.063', '2025-01-16 17:20:08.063');
INSERT INTO public.category VALUES (20, 'Service', 'Proposals and ideas for communal service enhancements', '2025-01-16 17:20:08.063', '2025-01-16 17:20:08.063');
INSERT INTO public.category VALUES (9, 'Event', 'Proposals and ideas for local gatherings, workshops, or cultural events.', '2024-12-27 15:11:30.701', '2024-12-27 15:11:30.701');
INSERT INTO public.category VALUES (21, 'MyLivingCity App Feature Suggestion', 'Suggestions for improving the MyLivingCity application', '2025-01-16 17:20:08.063', '2025-01-16 17:20:08.063');


--
-- TOC entry 3519 (class 0 OID 361987)
-- Dependencies: 203
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--
INSERT INTO public."user" VALUES ('cm4htz9hh003el806oat8fnet', 'RESIDENTIAL', 'testuser004@mylivingcity.org', '$argon2i$v=19$m=4096,t=3,p=1$/RRqZzekzevH90AvT9IdzQ$B1Mw0HiF3fSU+HdFAgmNp6TCP2CYl9Xx/zCXqDOERa4', 'Rudolf', 'Diesel', '2024-12-10 02:16:58.566', '2024-12-10 02:18:33.399', 'cm4htz9hh003fl806pru4p0hp', NULL, false, 0, 0, false, '', true, 'EXODRX', 'Rudolf', 'Paris Avenue', NULL, true);
INSERT INTO public."user" VALUES ('cm4h9p4k1001el8067oolrsbb', 'RESIDENTIAL', 'noleblanc@gmail.com', '$argon2i$v=19$m=4096,t=3,p=1$ULAxshJ9MEWGLvQXiLa7eA$o1icIbEN00JXiG9GyVBWc/Ko7lU7kdV8VNtcLAAbSM8', 'Nic', 'LeBlanc', '2024-12-09 16:49:13.298', '2024-12-09 17:01:10.761', 'cm4h9p4k1001fl806jhdhiwor', NULL, false, 0, 0, false, '', true, 'SLY1RR', 'Nic', 'Drake Avenue', NULL, true);
INSERT INTO public."user" VALUES ('cm65wo2820074l8069221ul8j', 'RESIDENTIAL', 'testuser011@mylivingcity.org', '$argon2i$v=19$m=4096,t=3,p=1$EeCn3CLxJjqb3OLdYTcBww$3ASl03ns474tymxrFxsVDJCAwMZY8vzMBXsHaqTFLQ0', 'Alexander', 'Bell', '2025-01-21 03:18:25.347', '2025-01-21 03:20:51.048', 'cm65wo2820075l806vu7ydrj9', NULL, false, 0, 0, false, '', true, 'F4FAAF', 'Alexander', 'Beinn Bhreagh St', NULL, true);
INSERT INTO public."user" VALUES ('cm4humete003yl806ffzxb4o9', 'RESIDENTIAL', 'testuser006@mylivingcity.org', '$argon2i$v=19$m=4096,t=3,p=1$uIyAtOq3TZGpRl10oIXUmQ$hGE5cJj6EDFU2q3vPU2G2y+qT80wWO3XHi1kJ9KdhNI', 'Helen', 'Keller', '2024-12-10 02:34:58.563', '2024-12-10 02:35:05.591', 'cm4humete003zl806s17og6y6', NULL, false, 0, 0, false, '', true, '2XHWD7', 'Helen', 'Fisgard St', NULL, true);
INSERT INTO public."user" VALUES ('cm65xh81d007ol8062w3m2vnl', 'MUNICIPAL', 'p.burton@cityvictoria.ca', '$argon2i$v=19$m=4096,t=3,p=1$JSL5Gn05FqrrCPf/nUyUjQ$yvFPAW9W14PGUtFOKaURvbhzYbCWJqeH37LffTSYN44', 'Pierre', 'Burton', '2025-01-21 03:41:05.906', '2025-01-21 03:41:05.906', 'cm65xh81d007pl806s6fawjyg', NULL, false, 0, 0, false, 'Victoria', true, 'cm65xh81d007ql806wnvo7y8v', 'Pierre', '', NULL, true);
INSERT INTO public."user" VALUES ('cm4hc2ydu002al806akxtnrsl', 'RESIDENTIAL', 'mylivingcitydev1@gmail.com', '$argon2i$v=19$m=4096,t=3,p=1$gnpy3Yqhavhb9kl/b8vleA$KVPM4v8KZ3IMjaq8YV1KuHd7iTjrTiZDjeoPzpBz4zE', 'Nic', 'LeBlanc', '2024-12-09 17:55:57.715', '2024-12-09 17:59:21.917', 'cm4hc2ydv002bl8068goki6e1', NULL, false, 0, 0, false, '', true, 'CVCC1I', 'Nic', 'Johnson St', NULL, true);
INSERT INTO public."user" VALUES ('cm4hvkcbs004il806bzksqj0p', 'COMMUNITY', 'testuser008@mylivingcity.org', '$argon2i$v=19$m=4096,t=3,p=1$g+YeVi71X/5DAMgCVskboQ$OxN/ptkePIAoRV5YwlzC3GmxC6RZslQ2BDEz1c3ddG8', '', 'Studious', '2024-12-10 03:01:21.64', '2024-12-10 03:09:37.451', 'cm4hvkcbs004jl806pki0zcy1', NULL, false, 0, 0, false, 'UVic Student Union', true, 'YXO1H4', '', 'Ring Road', NULL, true);
INSERT INTO public."user" VALUES ('cm4i1b7fs005el806o3jhmt23', 'MUNICIPAL_SEG_ADMIN', 'municipal_seg_admin95qm@mylivingcity.org', '$argon2i$v=19$m=4096,t=3,p=1$GQbdfKCQZWwUO1CIRJJJjw$hGnXg22muTMAIjw6yWCxfsirmGgzoSQRc0JxWk951Ps', 'Brian', 'Mulroney', '2024-12-10 05:42:13.096', '2024-12-10 05:42:13.096', 'cm4i1b7fs005fl806pae69m8e', NULL, false, 0, 0, false, 'Victoria', true, 'cm4i1b7fs005gl806rvsj3wxl', 'Brian', '', 'bmulroney@victoria.ca', true);
INSERT INTO public."user" VALUES ('cm4i1f5jr005yl806cjc5jwc6', 'MUNICIPAL_SEG_ADMIN', 'municipal_seg_admin87vr@mylivingcity.org', '$argon2i$v=19$m=4096,t=3,p=1$S4Vy07kdZq66pIAAxRBPiw$OFDmtQeIDIiqgr1Uti5DnQ7XUSVQGu5UXiVGb3+KqP8', 'Stephen', 'Harper', '2024-12-10 05:45:17.272', '2024-12-10 05:45:17.272', 'cm4i1f5jr005zl806k6nz51tj', NULL, false, 0, 0, false, 'Langford', true, 'cm4i1f5jr0060l806ywy60xl7', 'Stephen', '', 'sharper@langford.ca', true);
INSERT INTO public."user" VALUES ('cm605kwu40068l806uyzrpx52', 'BUSINESS', 'testuser009@mylivingcity.org', '$argon2i$v=19$m=4096,t=3,p=1$2l9TPxfPA4fUNvKvAg/Feg$fOzWA4q6wQ5U07cIUDaTFN030X3ADJURVFQBm+iwTpk', '', 'Marx', '2025-01-17 02:41:17.884', '2025-01-17 02:41:41.658', 'cm605kwu40069l8060kg47a8c', NULL, false, 0, 0, false, 'Uptown Administration', true, 'QRZA0Y', '', 'Uptown Boulevard', NULL, true);
INSERT INTO public."user" VALUES ('cm6eqv1ii0000lg06bw4zice6', 'RESIDENTIAL', 'alisa56567@gmail.com', '$argon2i$v=19$m=4096,t=3,p=1$gG5xA2CaZyi+DyIh3soTZg$xGajQcFV9KRxpOEiqgftpm7CIb6V0QAi0X/TljwrDZM', 'Sohee', 'Hwang', '2025-01-27 07:45:48.907', '2025-01-27 07:45:57.52', 'cm6eqv1ii0001lg068jhyi3fd', '1737963949222-KakaoTalk_20241202_185139636.jpg', false, 0, 0, false, '', false, '5Z2VQW', 'Sohee', '6176 Denbigh Ave', NULL, true);
INSERT INTO public."user" VALUES ('cm4hlbbxo002ul8069lvnnj73', 'RESIDENTIAL', 'testuser002@mylivingcity.org', '$argon2i$v=19$m=4096,t=3,p=1$NlETEAi8NyJB4tEf252Ysw$cad943Pxi9zYKJGoT9/nwxidHHn+6L0eyNFd/8isIjI', 'Marie', 'Curie', '2024-12-09 22:14:25.068', '2024-12-09 22:15:35.393', 'cm4hlbbxo002vl806iqjm0vnv', NULL, false, 0, 0, false, '', true, 'QKUXSG', 'Marie', 'Radium Avenue', NULL, true);
INSERT INTO public."user" VALUES ('cm6v18qri000alg06awi67bsh', 'RESIDENTIAL', 'nethang4@gmail.com', '$argon2i$v=19$m=4096,t=3,p=1$sZfzhLHP13r9GhviQS6cWg$gWa+xfCnN1WZzW3ldTwHqZEJqjYDHbis4zxuKoLUi3I', 'Brian', 'Nguyen', '2025-02-07 17:20:43.134', '2025-02-07 18:59:14.912', 'cm6v18qri000blg06czhr45q7', NULL, false, 0, 0, false, '', true, 'HRE1LA', 'Brian', '123 street', NULL, true);
INSERT INTO public."user" VALUES ('cm6forp0y0000uiofp5k5l1qg', 'RESIDENTIAL', 'gdasgdsag@gdagdsa.com', '$argon2i$v=19$m=4096,t=3,p=1$vdczz9fMKa9cEx5j20Xw6w$sjVclDY4mUMaMJhrfG6TGfIlNnOEbyqj2/+9VMGD4Wo', 'test', 'test', '2025-01-27 23:34:59.699', '2025-01-27 23:35:01.617', 'cm6forp0z0001uiof2306awd5', NULL, false, 0, 0, false, '', true, 'Z40O8N', 'test', 'teststes', 'gdasgdsag@gdagdsa.com', true);
INSERT INTO public."user" VALUES ('cm4huzcea0048l806ll0dhddx', 'RESIDENTIAL', 'testuser007@mylivingcity.org', '$argon2i$v=19$m=4096,t=3,p=1$59hAdIDYUbtcnSzt8+sY1g$sDAuXPJAkDf0pjlV6VIp13SFkczwO/7CkEEJyk5zIWs', 'Greta', 'Thunberg', '2024-12-10 02:45:01.955', '2024-12-10 02:50:49.934', 'cm4huzcea0049l8066sb9wolg', NULL, false, 0, 0, false, '', true, 'E49JP6', 'Greta', 'Superior St', NULL, true);
INSERT INTO public."user" VALUES ('cm4i18z9g0054l806g4ujmesy', 'MUNICIPAL_SEG_ADMIN', 'municipal_seg_admin75rs@mylivingcity.org', '$argon2i$v=19$m=4096,t=3,p=1$w+NXYM/aWPTDIriJpBbTWw$mieWMMHoIMqe/2mU2yNJej30wA/2xQTGscqT7sZBGxk', 'Wildred', 'Laurier', '2024-12-10 05:40:29.188', '2024-12-10 05:40:29.188', 'cm4i18z9g0055l806ibn97pv2', NULL, false, 0, 0, false, 'Saanich', true, 'cm4i18z9g0056l806yt59u06f', 'Wildred', '', 'wlaurier@saanich.ca', true);
INSERT INTO public."user" VALUES ('cm4ha0tva001ol806sqh2vuqa', 'COMMUNITY', 'mylivingcity2018@gmail.com', '$argon2i$v=19$m=4096,t=3,p=1$Ofa9PzCu7u+pVXtdpSO1tQ$OMaLt+CKQaqa4TGOPOFTJZkRO9DP41Kjg9w/xLNQa6o', '', 'LeBlanc', '2024-12-09 16:58:19.318', '2024-12-09 17:58:25.055', 'cm4ha0tva001pl806qx13e2cw', NULL, false, 0, 0, false, 'MyLivingCity', true, '39IUUK', '', 'Broad St', NULL, true);
INSERT INTO public."user" VALUES ('cm4i1dj6h005ol806wnw7vryk', 'MUNICIPAL_SEG_ADMIN', 'municipal_seg_admin33yp@mylivingcity.org', '$argon2i$v=19$m=4096,t=3,p=1$D0bNNvE7aAm8fociHB7KYg$vWAQa6zq5ithUbpyIQyyAh8/T+KSWiq/Eo7u0iTfRSc', 'Pierre', 'Trudeau', '2024-12-10 05:44:01.625', '2024-12-10 05:44:01.625', 'cm4i1dj6h005pl8060z81ni13', NULL, false, 0, 0, false, 'Esquimalt', true, 'cm4i1dj6h005ql8063r46unig', 'Pierre', '', 'ptrudeau@esquimalt.ca', true);
INSERT INTO public."user" VALUES ('cm4hkq0vv002kl806nfnhhvjf', 'RESIDENTIAL', 'testuser001@mylivingcity.org', '$argon2i$v=19$m=4096,t=3,p=1$2sTe4bXKVzAUV54tpwHo5w$yXTIPpocIQKxnyPsLtjE8/n9jlc99LfqmIb0DLlnGcU', 'Joseph', 'Smith', '2024-12-09 21:57:50.971', '2024-12-09 21:59:19.166', 'cm4hkq0vv002ll806774wt6oe', NULL, false, 0, 0, false, '', true, 'H9EZ3I', 'Joseph', 'Sooke Road', NULL, true);
INSERT INTO public."user" VALUES ('cm4hpmava0034l806d9nf2lzz', 'RESIDENTIAL', 'testuser003@mylivingcity.org', '$argon2i$v=19$m=4096,t=3,p=1$85Li2oTjVqK+2CzTALYUeg$OShKPFiicAARClgtiDjLEylBwFnF/lyNrFbuxsZPm5M', 'Mary', 'Shelley', '2024-12-10 00:14:55.366', '2024-12-10 00:15:16.798', 'cm4hpmava0035l8069nt3f00z', NULL, false, 0, 0, false, '', true, 'WKTVL0', 'Mary', 'Bavaria St', NULL, true);
INSERT INTO public."user" VALUES ('cluisf9fi004cqs062oko5671', 'ADMIN', 'admin08vo@mylivingcity.org', '$argon2i$v=19$m=4096,t=3,p=1$o02K4E15KbkEsikHNOMKXA$PSFfEk54pWwHWlgG9DSMG+VEKjSL/tznV72Vft1MCo8', 'Test', 'Admin', '2024-04-02 19:44:08.574', '2024-04-02 19:44:08.574', 'cluisf9fi004dqs06mndow0ql', '', false, 0, 0, false, '', true, 'cluisf9fi004eqs06wv8olz60', 'Test', '', 'testadmin001@mylivingcity.org', true);
INSERT INTO public."user" VALUES ('cm4huch4e003ol806sp63ltf0', 'RESIDENTIAL', 'testuser005@mylivingcity.org', '$argon2i$v=19$m=4096,t=3,p=1$1f7ZkYVnEk+7Xf8bb2/A9w$qOvEeHjCl1ytWEKmmQkQD1mapNrwt56tqA61sPswxdY', 'Sigmund', 'Freud', '2024-12-10 02:27:14.991', '2024-12-10 02:28:28.656', 'cm4huch4e003pl80603e5fawa', NULL, false, 0, 0, false, '', true, 'PBZGPW', 'Sigmund', 'Moravia St', NULL, true);
INSERT INTO public."user" VALUES ('cm65vicnd006ul806fahzfmhr', 'RESIDENTIAL', 'testuser010@mylivingcity.org', '$argon2i$v=19$m=4096,t=3,p=1$DNQJ2WEHyUiZfL8/WIQz5g$htxeb461xxpPWo5Rq0rpeLDICDwIakGZWK2vAX1ma84', 'Montgomery', 'Scott', '2025-01-21 02:45:59.306', '2025-01-21 02:48:59.89', 'cm65vicnd006vl8067i0kkw08', NULL, false, 0, 0, false, '', true, 'N33AFC', 'Montgomery', 'Endinburg St', NULL, true);
INSERT INTO public."user" VALUES ('cm65xdjtp007el806j5gwno25', 'MUNICIPAL', 'v.woolf@saanich.ca', '$argon2i$v=19$m=4096,t=3,p=1$W08lVuyoUowPX38s8EvAHg$R1mxU3GAbQnVRma1oZxHBBUCLDy9al4eTw88oZg6QPg', 'Virginia', 'Woolf', '2025-01-21 03:38:14.557', '2025-01-21 03:38:14.557', 'cm65xdjtp007fl806i41y2pxy', NULL, false, 0, 0, false, 'Victoria', true, 'cm65xdjtp007gl80619q7ml3g', 'Virginia', '', NULL, true);
INSERT INTO public."user" VALUES ('cm69jv70g0000uiap1cw35gty', 'RESIDENTIAL', 'radmirgaripovrss@gmail.com', '$argon2i$v=19$m=4096,t=3,p=1$ua0hmoaN42KV6nWa0KjJqA$DSL4yJdJyZ6xS95WNuVL2diatKCIc1KDH/aJ2/MLTIM', 'Radmir', 'Garipov', '2025-01-23 16:31:07.841', '2025-01-23 16:32:35.458', 'cm69jv70i0001uiaprfv6ff59', NULL, false, 0, 0, false, '', true, 'BJ3DPR', 'Radmir', 'gdasgdsa', NULL, true);


--

--
-- TOC entry 3543 (class 0 OID 362278)
-- Dependencies: 227
-- Data for Name: segment; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- Insert Super Segments FIRST
WITH super_segments AS (
    INSERT INTO public.segment (country, province, segment_name, created_at, update_at, lat, lon, "parentId", radius, "segmentType")
    VALUES
        ('Canada', 'British Columbia', 'CRD', NOW(), NOW(), NULL, NULL, NULL, NULL, 'superSegment'::"SegmentType"),
        ('Canada', 'British Columbia', 'Middle-Earth', NOW(), NOW(), NULL, NULL, NULL, NULL, 'superSegment'::"SegmentType"),
        ('Canada', 'British Columbia', 'MVRD', NOW(), NOW(), NULL, NULL, NULL, NULL, 'superSegment'::"SegmentType")
    RETURNING seg_id, segment_name
)
SELECT * FROM super_segments;

-- Insert Segments NEXT, referencing Super Segment IDs
WITH segments AS (
    INSERT INTO public.segment (country, province, segment_name, created_at, update_at, lat, lon, "parentId", radius, "segmentType")
    VALUES
        ('Canada', 'British Columbia', 'Saanich', NOW(), NOW(), NULL, NULL, 
         (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'), NULL, 'segment'::"SegmentType"),
        ('Canada', 'British Columbia', 'Oak Bay', NOW(), NOW(), NULL, NULL, 
         (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'), NULL, 'segment'::"SegmentType"),
        ('Canada', 'British Columbia', 'Langford', NOW(), NOW(), NULL, NULL, 
         (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'), NULL, 'segment'::"SegmentType"),
        ('Canada', 'British Columbia', 'Victoria', NOW(), NOW(), NULL, NULL, 
         (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'), NULL, 'segment'::"SegmentType"),
        ('Canada', 'British Columbia', 'Esquimalt', NOW(), NOW(), NULL, NULL, 
         (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'), NULL, 'segment'::"SegmentType"),
        ('Canada', 'British Columbia', 'Mordor', NOW(), NOW(), NULL, NULL, 
         (SELECT seg_id FROM public.segment WHERE segment_name = 'Middle-Earth'), NULL, 'segment'::"SegmentType"),
        ('Canada', 'British Columbia', 'Gondor', NOW(), NOW(), NULL, NULL, 
         (SELECT seg_id FROM public.segment WHERE segment_name = 'Middle-Earth'), NULL, 'segment'::"SegmentType"),
        ('Canada', 'British Columbia', 'Minas Tirith', NOW(), NOW(), NULL, NULL, 
         (SELECT seg_id FROM public.segment WHERE segment_name = 'Middle-Earth'), NULL, 'segment'::"SegmentType")
    RETURNING seg_id, segment_name
)
SELECT * FROM segments; 

-- Insert SubSegments LAST, referencing the correct Segment IDs
INSERT INTO public.segment (country, province, segment_name, created_at, update_at, lat, lon, "parentId", radius, "segmentType")
VALUES
    ('Canada', 'British Columbia', 'Uptown', NOW(), NOW(), 2.1, 2.1, 
     (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'), 5.0, 'subSegment'::"SegmentType"),
    ('Canada', 'British Columbia', 'Esquimalt Village', NOW(), NOW(), 4.1, 4.1, 
     (SELECT seg_id FROM public.segment WHERE segment_name = 'Esquimalt'), 5.0, 'subSegment'::"SegmentType"),
    ('Canada', 'British Columbia', 'Westbay Village', NOW(), NOW(), 4.2, 4.2, 
     (SELECT seg_id FROM public.segment WHERE segment_name = 'Esquimalt'), 5.0, 'subSegment'::"SegmentType"),
    ('Canada', 'British Columbia', 'Goldstream Station', NOW(), NOW(), 4.1, 4.1, 
     (SELECT seg_id FROM public.segment WHERE segment_name = 'Langford'), 5.0, 'subSegment'::"SegmentType"),
    ('Canada', 'British Columbia', 'UVIC', NOW(), NOW(), 2.2, 2.2, 
     (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'), 5.0, 'subSegment'::"SegmentType"),
    ('Canada', 'British Columbia', 'Cadboro Bay', NOW(), NOW(), 3.1, 3.1, 
     (SELECT seg_id FROM public.segment WHERE segment_name = 'Oak Bay'), 5.0, 'subSegment'::"SegmentType"),
    ('Canada', 'British Columbia', 'Riverside', NOW(), NOW(), 2.3, 2.3, 
     (SELECT seg_id FROM public.segment WHERE segment_name = 'Minas Tirith'), 5.0, 'subSegment'::"SegmentType"),
    ('Canada', 'British Columbia', 'Fairfield', NOW(), NOW(), 1.0, 1.0, 
     (SELECT seg_id FROM public.segment WHERE segment_name = 'Victoria'), 1.0, 'subSegment'::"SegmentType"),
    ('Canada', 'British Columbia', 'Downtown', NOW(), NOW(), 2.0, 2.0, 
     (SELECT seg_id FROM public.segment WHERE segment_name = 'Victoria'), 2.0, 'subSegment'::"SegmentType"),
    ('Canada', 'British Columbia', 'Doomview', NOW(), NOW(), 1.3, 1.3, 
     (SELECT seg_id FROM public.segment WHERE segment_name = 'Mordor'), 5.0, 'subSegment'::"SegmentType"),
    ('Canada', 'British Columbia', 'Whitewall', NOW(), NOW(), 1.1, 1.2, 
     (SELECT seg_id FROM public.segment WHERE segment_name = 'Gondor'), 5.0, 'subSegment'::"SegmentType"),
    ('Canada', 'British Columbia', 'Orcburg', NOW(), NOW(), 1.4, 1.4, 
     (SELECT seg_id FROM public.segment WHERE segment_name = 'Mordor'), 5.0, 'subSegment'::"SegmentType"),
    ('Canada', 'British Columbia', 'Camosun Interurban', NOW(), NOW(), 2.3, 2.3, 
     (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'), 5.0, 'subSegment'::"SegmentType"),
    ('Canada', 'British Columbia', 'NastyVale', NOW(), NOW(), 1.5, 1.5, 
     (SELECT seg_id FROM public.segment WHERE segment_name = 'Mordor'), 5.0, 'subSegment'::"SegmentType");

-- TOC entry 3527 (class 0 OID 362036)
-- Dependencies: 211
-- IDEA
INSERT INTO public.idea VALUES (160, 'cm4hvkcbs004il806bzksqj0p', 9, 'Community Connections: Empowering Victoria', 'The goal of this proposal is to [state the main objective, e.g., create a community garden, launch a tech workshop, or organize a cultural festival]. The project will [describe what it looks like, e.g., transform unused land into a vibrant space for growing food, or host regular workshops to teach new skills]. It will work by [explain the process, e.g., engaging volunteers, partnering with local organizations].', 'Promoting water conservation or renewable energy solutions to improve sustainability. Example: Insta', 'Encouraging responsible production and waste management through innovative programs. Example: Settin', NULL, NULL, NULL, 'PROPOSAL', true, NOW(), NOW(), NULL, 'Resident', NULL, NULL, false, false, false, '2024-12-27 23:20:19.817', 'This proposal will benefit the community by [describe the direct and indirect impacts, e.g., improving access to fresh produce, fostering connections among residents, or providing educational opportunities]. It will also [mention specific positive changes, e.g., beautify the neighborhood, reduce food insecurity, or boost local culture]. By involving community members in every step of the project,', 'I am Cameron Fun, a dedicated community organizer with experience in Sustainable technology.', 'People: A team of [number of volunteers/staff] to manage operations, outreach, and logistics. Resources: [List specific items, e.g., gardening tools, educational materials, or construction supplies]. Land Use Agreement: Permission to use [describe the location, e.g., an unused park, community center, or vacant lot]. Municipal Support: Collaboration with local authorities for [specific needs, e.g.,]');
INSERT INTO public.idea VALUES (161, 'cm4hvkcbs004il806bzksqj0p', 10, 'Campus Improvement Grant', 'A $10,000 budget is available for a variety of campus improvement ideas, we are looking to solicit ideas from the community on what they would like to see on campus.', 'Campus improved for better student experience', NULL, NULL, NULL, NULL, 'PROPOSAL', true, NOW(), NOW(), NULL, 'Resident', NULL, NULL, false, false, false, '2024-12-27 23:59:20.681', 'Improve the campus infrastructure for an improved student experience.', 'The UVic Student Union is an on-campus organization to support students and the student experience on the UVic Campus, working in partnership with the UVic Administration.', 'We are looking for idea solicitations, what can be made using the submit idea button on this page.');
INSERT INTO public.idea VALUES (162, 'cm4ha0tva001ol806sqh2vuqa', 10, 'Downtown Food Garden Boxes', 'Build and setup garden boxes in the downtown core for local food production.', 'Create spaces for gardening', 'Local food supply', 'Community learning opportunity on growing food', NULL, NULL, 'PROPOSAL', true, NOW(), NOW(), NULL, 'Resident', NULL, NULL, false, false, false, '2024-12-28 03:04:37.728', 'Ability for residents to work together to grow in local garden boxes, and benefit from a local low-cost food supply.', 'MyLivingCity is a Victoria-based non-profit dedicated to creating a more sustainable community.', 'In order to complete this project, an organizing committee will be needed, along with several volunteers to participate in a build weekend, as well as carpentry tools and lumber.');
INSERT INTO public.idea VALUES (163, 'cm4hvkcbs004il806bzksqj0p', 9, 'jknkjn', 'dasfads', NULL, NULL, NULL, NULL, NULL, 'IDEA', true, NOW(), NOW(), NULL, 'Resident', NULL, NULL, false, false, false, '2024-12-31 21:13:30.969', '', '', '');
INSERT INTO public.idea VALUES (168, 'cm605kwu40068l806uyzrpx52', 9, 'UpTown Zero Waste Day', 'For all business, tenants, and customers of Uptown to make a full-day effort to not create any waste out of their activities onsite as a learning experience and test of their own waste reduction strategies.', 'Create community engagement in reducing waste', NULL, 'Learning and awareness activity for the reduction of waste', NULL, 'Testing and improving zero waste policies and efforts', 'PROPOSAL', true, NOW(), NOW(), NULL, 'Resident', NULL, NULL, false, false, false, '2025-01-17 02:47:34.857', 'Awareness and learning opportunity, as well as testing new waste reduction and circular economy innovations.', '', 'A central planning committee directing the communication and coordination effort with site management, tenants, and an engagement effort to businesses and clients for participation.');
INSERT INTO public.idea VALUES (169, 'cm4huch4e003ol806sp63ltf0', 10, 'Expanded covered bike parking at student union building', 'A new bicycle parking should be built by the student union building, covered by solar panels both as rain cover and renewable energy generation.', 'Improve human-powered transportation', NULL, NULL, 'Provide additional renewable power for E-Bike Charging', NULL, 'IDEA', true, NOW(), NOW(), NULL, 'Resident', '1737082610902-R-Net-PV-op-dak-fietsenstalling.jpg', NULL, false, false, false, '2025-01-17 02:56:51.192', '', '', '');
INSERT INTO public.idea VALUES (170, 'cm65vicnd006ul806fahzfmhr', 10, 'Pickleball Court for Campus', 'Create a Pickleball Court on campus for students and staff to use between class to de-stress.', 'Creating areas for social and sports interaction', NULL, NULL, NULL, NULL, 'IDEA', true, NOW(), NOW(), NULL, 'Resident', NULL, NULL, false, false, false, NOW(), '', '', '');
INSERT INTO public.idea VALUES (164, 'cm4hkq0vv002kl806nfnhhvjf', 9, 'Complimentary Umbrella Stations', 'Having complimentary umbrella stations at building entrances that can be used by students and staff for rainy days to move from building to building.', 'Improved experience in human-powered transportation', NULL, NULL, NULL, NULL, 'IDEA', true, NOW(), NOW(), NULL, 'Resident', '1737079539896-umbrella-rack-in-hotel-lobby-japan-2B9FCJB.jpg', NULL, false, false, false, '2025-01-17 02:05:40.271', '', '', '');
INSERT INTO public.idea VALUES (165, 'cm4hkq0vv002kl806nfnhhvjf', 19, 'Community Gardens on Campus', 'Having a community garden space set up so that students and staff can grow food and garden on campus.', 'Have a space for community to gather and garden, grow food and harvest communally.', 'Increasing availability of food supply for local people', NULL, NULL, NULL, 'IDEA', true, NOW(), NOW(), NULL, 'Resident', NULL, NULL, false, false, false, '2025-01-17 02:09:45.328', '', '', '');
INSERT INTO public.idea VALUES (166, 'cm4hpmava0034l806d9nf2lzz', 10, 'Outdoor Gym on UVic campus', 'Having an outdoor gym on the UVic campus to encourage students and local community members to exercise outside in the open air.', 'Community spaces for outdoor recreation in a natural setting', NULL, NULL, NULL, NULL, 'IDEA', true, NOW(), NOW(), NULL, 'Resident', '1737080015835-download.jpg', NULL, false, false, false, '2025-01-17 02:13:36.084', '', '', '');
INSERT INTO public.idea VALUES (167, 'cm4hpmava0034l806d9nf2lzz', 10, 'New Metchosin to Oak Bay Green Corridor/Bike Path', 'Create a new bike/walking path from Metchosin to Oak Bay and create an urban forest corridor across the CRD in the process.', 'Improve human-powered transportation', 'Increase access to natural spaces along public roads and increase biodiversity', NULL, NULL, NULL, 'IDEA', true, NOW(), NOW(), NULL, 'Resident', '1737080308285-bike path.jpg', NULL, false, false, false, '2025-01-17 02:18:28.53', '', '', '');
INSERT INTO public.idea VALUES (171, 'cm4ha0tva001ol806sqh2vuqa', 20, 'Excess Food Pickup and Redistribution Service', 'Having a downtown-based excess food pickup service that any restaurant or business with excess food items could donate to local food banks or other charity food provisioning services to prevent food waste.', NULL, 'Providing more options for food for impoverished individuals', NULL, NULL, 'Reducing food waste in the downtown region', 'IDEA', true, NOW(), NOW(), NULL, 'Resident', '1737438673429-images.jpg', NULL, false, false, false, '2025-01-21 05:51:13.679', '', '', '');
INSERT INTO public.idea VALUES (172, 'cm4ha0tva001ol806sqh2vuqa', 9, 'Net Zero Fair', 'The Net Zero Fair will be a full-day event to showcase local solutions and services to help residents and businesses reach their net zero goals. It will feature a kiosk zone for displays and booths, as well as a presentation venue for discussions and talks during the day.', NULL, NULL, 'Community learning opportunity on increasing ability to reach Net Zero', NULL, NULL, 'PROPOSAL', true, NOW(), NOW(), NULL, 'Resident', '1737439556826-cusa-tea-outdoor-vendor-setup.jpg', NULL, false, false, false, '2025-01-21 06:05:57.308', 'Ability for residents and businesses to make connections to further their Net Zero goals, as well as learn about locally available solutions.', 'MyLivingCity is a local non-profit dedicated to improving the sustainability of cities and communities.', 'We will be looking for businesses and organizations who would like to set up a booth, for presenters, as well as general volunteers to ensure the event happens smoothly during the day, as well as setup and tear-down assistance.');
INSERT INTO public.idea VALUES (173, 'cluisf9fi004cqs062oko5671', 10, 'test1', 'test1', NULL, NULL, NULL, NULL, NULL, 'IDEA', true, NOW(), NOW(), NULL, 'Resident', NULL, NULL, false, false, false, '2025-01-27 23:51:49.186', '', '', '');
INSERT INTO public.idea VALUES (174, 'cm4huch4e003ol806sp63ltf0', 10, 'Community Garden on vacant lot (Corner of East and West St)', 'The vacant lot on East and West St has no immediate plans for development, let''s create modular temporary community garden plots so the community can use the space until development work actually happens. This will potentially give us several years of use until that happens.', 'Create a community space for gardening', 'Local food supply', NULL, NULL, NULL, 'IDEA', true, NOW(), NOW(), NULL, 'Resident', '1739156300913-broadway-victoria-temporary-community-garden (1).jpg', NULL, false, false, false, '2025-02-10 02:58:21.566', '', '', '');


-- TOC entry 3529 (class 0 OID 362051)
-- Dependencies: 213
-- Data for Name: proposal; Type: TABLE DATA; Schema: public; Owner: postgres
--
INSERT INTO public.proposal VALUES (5, 160, '', '', '', '', '', true, true, false, false, true, 'Victoria', 'YESNO', 'YESNO', 'YESNO', 'YESNO', 'YESNO');
INSERT INTO public.proposal VALUES (6, 161, '', '', '', '', '', false, false, false, true, false, '', 'YESNO', 'YESNO', 'YESNO', 'YESNO', 'YESNO');
INSERT INTO public.proposal VALUES (7, 162, 'Would you be interested in participating participating as a gardener?', 'Would you partaking in the food share?', 'How likely are you to participate (0 Low to 10 High)', '', '', true, true, false, false, true, '', 'YESNO', 'YESNO', 'YESNO', 'YESNO', 'YESNO');
INSERT INTO public.proposal VALUES (8, 168, 'If you are an Uptown business owner or employee, How likely are you to participate?', 'If you are a customer, would you be more likely to visit UpTown on a zero waste day?', '', '', '', true, false, false, false, true, '', 'YESNO', 'YESNO', 'YESNO', 'YESNO', 'YESNO');
INSERT INTO public.proposal VALUES (9, 172, 'How likely are you to attend this event', '', '', '', '', true, false, false, false, true, '', 'RATING', 'YESNO', 'YESNO', 'YESNO', 'YESNO');


-- Update ideas to insert proposal id for supporting proposal in:
UPDATE public.idea SET supporting_proposal_id = 6 WHERE id = 163;
UPDATE public.idea SET supporting_proposal_id = 6 WHERE id = 169;
UPDATE public.idea SET supporting_proposal_id = 6 WHERE id = 170;
UPDATE public.idea SET supporting_proposal_id = 6 WHERE id = 164;
UPDATE public.idea SET supporting_proposal_id = 6 WHERE id = 165;
UPDATE public.idea SET supporting_proposal_id = 6 WHERE id = 166;


--
-- TOC entry 3590 (class 0 OID 363464)
-- Dependencies: 274
-- Data for Name: FeedbackRating; Type: TABLE DATA; Schema: public; Owner: postgres
--
INSERT INTO public."FeedbackRating" VALUES (15, 7, 'cm4hkq0vv002kl806nfnhhvjf', 1, '', '2024-12-28 03:12:30.985', '2024-12-28 03:12:30.985', 1);
INSERT INTO public."FeedbackRating" VALUES (16, 7, 'cm4hkq0vv002kl806nfnhhvjf', 1, '', '2024-12-28 03:12:34.533', '2024-12-28 03:12:34.533', 2);
INSERT INTO public."FeedbackRating" VALUES (17, 7, 'cm4hkq0vv002kl806nfnhhvjf', 1, '', '2024-12-28 03:12:37.829', '2024-12-28 03:12:37.829', 3);
INSERT INTO public."FeedbackRating" VALUES (18, 8, 'cm605kwu40068l806uyzrpx52', 1, '', '2025-01-17 02:47:54.766', '2025-01-17 02:47:54.766', 1);
INSERT INTO public."FeedbackRating" VALUES (19, 8, 'cm605kwu40068l806uyzrpx52', 1, '', '2025-01-17 02:48:02.495', '2025-01-17 02:48:02.495', 2);
INSERT INTO public."FeedbackRating" VALUES (20, 8, 'cm65vicnd006ul806fahzfmhr', 1, '', '2025-01-21 02:59:50.724', '2025-01-21 02:59:50.724', 1);
INSERT INTO public."FeedbackRating" VALUES (21, 8, 'cm65vicnd006ul806fahzfmhr', 1, '', '2025-01-21 02:59:55.972', '2025-01-21 02:59:55.972', 2);
INSERT INTO public."FeedbackRating" VALUES (22, 7, 'cm4ha0tva001ol806sqh2vuqa', 1, '', '2025-01-21 05:56:10.255', '2025-01-21 05:56:10.255', 1);
INSERT INTO public."FeedbackRating" VALUES (23, 7, 'cm4ha0tva001ol806sqh2vuqa', 2, '', '2025-01-21 05:56:12.848', '2025-01-21 05:56:12.848', 2);
INSERT INTO public."FeedbackRating" VALUES (24, 9, 'cm4ha0tva001ol806sqh2vuqa', 5, '', '2025-01-21 06:06:03.114', '2025-01-21 06:06:03.114', 1);
INSERT INTO public."FeedbackRating" VALUES (25, 9, 'cm4hkq0vv002kl806nfnhhvjf', 4, '', '2025-01-21 06:08:36.566', '2025-01-21 06:08:36.566', 1);
INSERT INTO public."FeedbackRating" VALUES (26, 7, 'cm4huch4e003ol806sp63ltf0', 1, '', '2025-02-10 01:26:15.367', '2025-02-10 01:26:15.367', 1);
INSERT INTO public."FeedbackRating" VALUES (27, 7, 'cm4huch4e003ol806sp63ltf0', 1, '', '2025-02-10 02:49:55.085', '2025-02-10 02:49:55.085', 2);
INSERT INTO public."FeedbackRating" VALUES (28, 7, 'cm4ha0tva001ol806sqh2vuqa', 1, '', '2025-02-10 03:18:19.877', '2025-02-10 03:18:19.877', 3);


--
-- TOC entry 3546 (class 0 OID 362307)
-- Dependencies: 230
-- Data for Name: user_segment; Type: TABLE DATA; Schema: public; Owner: postgres
--
-- UUID version, requires unique insertions, keeping it here in case we need it for some reason
/*
INSERT INTO public."user_segment" VALUES ('cm4hc2ydv002el806pdnku91l', 'cm4hc2ydu002al806akxtnrsl', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES ('cm4hc2ydv002el806pdnku91l', 'cm4hc2ydu002al806akxtnrsl', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Victoria'));
INSERT INTO public."user_segment" VALUES ('cm4hc2ydv002el806pdnku91l', 'cm4hc2ydu002al806akxtnrsl', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Downtown'));
INSERT INTO public."user_segment" VALUES ('cm4hkq0vv002ol806c4ksv5hf', 'cm4hkq0vv002kl806nfnhhvjf', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES ('cm4hkq0vv002ol806c4ksv5hf', 'cm4hkq0vv002kl806nfnhhvjf', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Victoria'));
INSERT INTO public."user_segment" VALUES ('cm4hkq0vv002ol806c4ksv5hf', 'cm4hkq0vv002kl806nfnhhvjf', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Downtown'));
INSERT INTO public."user_segment" VALUES ('cm4hkq0vv002ol806c4ksv5hf', 'cm4hkq0vv002kl806nfnhhvjf', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES ('cm4hkq0vv002ol806c4ksv5hf', 'cm4hkq0vv002kl806nfnhhvjf', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'));
INSERT INTO public."user_segment" VALUES ('cm4hkq0vv002ol806c4ksv5hf', 'cm4hkq0vv002kl806nfnhhvjf', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'UVIC'));
INSERT INTO public."user_segment" VALUES ('cm65wo2830078l8064ejcs76d', 'cm65wo2820074l8069221ul8j', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES ('cm65wo2830078l8064ejcs76d', 'cm65wo2820074l8069221ul8j', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Victoria'));
INSERT INTO public."user_segment" VALUES ('cm65wo2830078l8064ejcs76d', 'cm65wo2820074l8069221ul8j', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Fairfield'));
INSERT INTO public."user_segment" VALUES ('cm65wo2830078l8064ejcs76d', 'cm65wo2820074l8069221ul8j', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES ('cm65wo2830078l8064ejcs76d', 'cm65wo2820074l8069221ul8j', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Victoria'));
INSERT INTO public."user_segment" VALUES ('cm65wo2830078l8064ejcs76d', 'cm65wo2820074l8069221ul8j', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES ('cm65wo2830078l8064ejcs76d', 'cm65wo2820074l8069221ul8j', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'));
INSERT INTO public."user_segment" VALUES ('cm65wo2830078l8064ejcs76d', 'cm65wo2820074l8069221ul8j', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'UVIC'));
INSERT INTO public."user_segment" VALUES ('cm65vicne006yl8060ruitrbx', 'cm65vicnd006ul806fahzfmhr', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES ('cm65vicne006yl8060ruitrbx', 'cm65vicnd006ul806fahzfmhr', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'));
INSERT INTO public."user_segment" VALUES ('cm65vicne006yl8060ruitrbx', 'cm65vicnd006ul806fahzfmhr', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Uptown'));
INSERT INTO public."user_segment" VALUES ('cm65vicne006yl8060ruitrbx', 'cm65vicnd006ul806fahzfmhr', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES ('cm65vicne006yl8060ruitrbx', 'cm65vicnd006ul806fahzfmhr', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'));
INSERT INTO public."user_segment" VALUES ('cm65vicne006yl8060ruitrbx', 'cm65vicnd006ul806fahzfmhr', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'UVIC'));
INSERT INTO public."user_segment" VALUES ('cm65xdjtp007il806noc031z5', 'cm65xdjtp007el806j5gwno25', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES ('cm65xdjtp007il806noc031z5', 'cm65xdjtp007el806j5gwno25', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Victoria'));
INSERT INTO public."user_segment" VALUES ('cm4huzceb004cl8064qob3rkb', 'cm4huzcea0048l806ll0dhddx', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES ('cm4huzceb004cl8064qob3rkb', 'cm4huzcea0048l806ll0dhddx', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Victoria'));
INSERT INTO public."user_segment" VALUES ('cm4huzceb004cl8064qob3rkb', 'cm4huzcea0048l806ll0dhddx', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Downtown'));
INSERT INTO public."user_segment" VALUES ('cm4huzceb004cl8064qob3rkb', 'cm4huzcea0048l806ll0dhddx', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES ('cm4huzceb004cl8064qob3rkb', 'cm4huzcea0048l806ll0dhddx', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'));
INSERT INTO public."user_segment" VALUES ('cm4huzceb004cl8064qob3rkb', 'cm4huzcea0048l806ll0dhddx', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Uptown'));
INSERT INTO public."user_segment" VALUES ('cm4huzceb004cl8064qob3rkb', 'cm4huzcea0048l806ll0dhddx', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES ('cm4huzceb004cl8064qob3rkb', 'cm4huzcea0048l806ll0dhddx', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'));
INSERT INTO public."user_segment" VALUES ('cm4huzceb004cl8064qob3rkb', 'cm4huzcea0048l806ll0dhddx', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Camosun Interurban'));
INSERT INTO public."user_segment" VALUES ('cm4humetf0042l806eckeomjd', 'cm4humete003yl806ffzxb4o9', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES ('cm4humetf0042l806eckeomjd', 'cm4humete003yl806ffzxb4o9', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Victoria'));
INSERT INTO public."user_segment" VALUES ('cm4humetf0042l806eckeomjd', 'cm4humete003yl806ffzxb4o9', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Downtown'));
INSERT INTO public."user_segment" VALUES ('cm4humetf0042l806eckeomjd', 'cm4humete003yl806ffzxb4o9', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES ('cm4humetf0042l806eckeomjd', 'cm4humete003yl806ffzxb4o9', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'));
INSERT INTO public."user_segment" VALUES ('cm4humetf0042l806eckeomjd', 'cm4humete003yl806ffzxb4o9', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Uptown'));
INSERT INTO public."user_segment" VALUES ('cm4humetf0042l806eckeomjd', 'cm4humete003yl806ffzxb4o9', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES ('cm4humetf0042l806eckeomjd', 'cm4humete003yl806ffzxb4o9', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'));
INSERT INTO public."user_segment" VALUES ('cm4humetf0042l806eckeomjd', 'cm4humete003yl806ffzxb4o9', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Camosun Interurban'));
INSERT INTO public."user_segment" VALUES ('cm4hvkcbs004ml806ycb9zdj0', 'cm4hvkcbs004il806bzksqj0p', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES ('cm4hvkcbs004ml806ycb9zdj0', 'cm4hvkcbs004il806bzksqj0p', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'));
INSERT INTO public."user_segment" VALUES ('cm4hvkcbs004ml806ycb9zdj0', 'cm4hvkcbs004il806bzksqj0p', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'UVIC'));
INSERT INTO public."user_segment" VALUES ('cm4i18z9g0058l806jsl44118', 'cm4i18z9g0054l806g4ujmesy', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES ('cm4i18z9g0058l806jsl44118', 'cm4i18z9g0054l806g4ujmesy', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'));
INSERT INTO public."user_segment" VALUES ('cm4i1b7fs005il80684z6l7n3', 'cm4i1b7fs005el806o3jhmt23', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES ('cm4i1b7fs005il80684z6l7n3', 'cm4i1b7fs005el806o3jhmt23', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Victoria'));
INSERT INTO public."user_segment" VALUES ('cm4i1dj6h005sl806fyeoagjp', 'cm4i1dj6h005ol806wnw7vryk', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES ('cm4i1dj6h005sl806fyeoagjp', 'cm4i1dj6h005ol806wnw7vryk', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Esquimalt'));
INSERT INTO public."user_segment" VALUES ('cm4i1f5jr0062l806wa4cxlw6', 'cm4i1f5jr005yl806cjc5jwc6', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES ('cm4i1f5jr0062l806wa4cxlw6', 'cm4i1f5jr005yl806cjc5jwc6', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Langford'));
INSERT INTO public."user_segment" VALUES ('cm4hlbbxo002yl8063xc6r0p8', 'cm4hlbbxo002ul8069lvnnj73', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES ('cm4hlbbxo002yl8063xc6r0p8', 'cm4hlbbxo002ul8069lvnnj73', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Victoria'));
INSERT INTO public."user_segment" VALUES ('cm4hlbbxo002yl8063xc6r0p8', 'cm4hlbbxo002ul8069lvnnj73', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Fairfield'));
INSERT INTO public."user_segment" VALUES ('cm4hlbbxo002yl8063xc6r0p8', 'cm4hlbbxo002ul8069lvnnj73', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES ('cm4hlbbxo002yl8063xc6r0p8', 'cm4hlbbxo002ul8069lvnnj73', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'));
INSERT INTO public."user_segment" VALUES ('cm4hlbbxo002yl8063xc6r0p8', 'cm4hlbbxo002ul8069lvnnj73', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'UVIC'));
INSERT INTO public."user_segment" VALUES ('cm65xh81e007sl8069earjwca', 'cm65xh81d007ol8062w3m2vnl', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES ('cm65xh81e007sl8069earjwca', 'cm65xh81d007ol8062w3m2vnl', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Victoria'));
INSERT INTO public."user_segment" VALUES ('cm4huch4e003sl8065f2wky34', 'cm4huch4e003ol806sp63ltf0', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES ('cm4huch4e003sl8065f2wky34', 'cm4huch4e003ol806sp63ltf0', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'));
INSERT INTO public."user_segment" VALUES ('cm4huch4e003sl8065f2wky34', 'cm4huch4e003ol806sp63ltf0', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES ('cm4huch4e003sl8065f2wky34', 'cm4huch4e003ol806sp63ltf0', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'));
INSERT INTO public."user_segment" VALUES ('cm4huch4e003sl8065f2wky34', 'cm4huch4e003ol806sp63ltf0', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'UVIC'));
INSERT INTO public."user_segment" VALUES ('cm4hpmava0038l806u1sk42o8', 'cm4hpmava0034l806d9nf2lzz', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES ('cm4hpmava0038l806u1sk42o8', 'cm4hpmava0034l806d9nf2lzz', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Esquimalt'));
INSERT INTO public."user_segment" VALUES ('cm4hpmava0038l806u1sk42o8', 'cm4hpmava0034l806d9nf2lzz', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Esquimalt Village'));
INSERT INTO public."user_segment" VALUES ('cm4hpmava0038l806u1sk42o8', 'cm4hpmava0034l806d9nf2lzz', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES ('cm4hpmava0038l806u1sk42o8', 'cm4hpmava0034l806d9nf2lzz', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'));
INSERT INTO public."user_segment" VALUES ('cm4hpmava0038l806u1sk42o8', 'cm4hpmava0034l806d9nf2lzz', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Uptown'));
INSERT INTO public."user_segment" VALUES ('cm4hpmava0038l806u1sk42o8', 'cm4hpmava0034l806d9nf2lzz', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES ('cm4hpmava0038l806u1sk42o8', 'cm4hpmava0034l806d9nf2lzz', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'));
INSERT INTO public."user_segment" VALUES ('cm4hpmava0038l806u1sk42o8', 'cm4hpmava0034l806d9nf2lzz', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'UVIC'));
INSERT INTO public."user_segment" VALUES ('cm4htz9hi003il806z7klcadx', 'cm4htz9hh003el806oat8fnet', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES ('cm4htz9hi003il806z7klcadx', 'cm4htz9hh003el806oat8fnet', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Esquimalt'));
INSERT INTO public."user_segment" VALUES ('cm4htz9hi003il806z7klcadx', 'cm4htz9hh003el806oat8fnet', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Westbay Village'));
INSERT INTO public."user_segment" VALUES ('cm4htz9hi003il806z7klcadx', 'cm4htz9hh003el806oat8fnet', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES ('cm4htz9hi003il806z7klcadx', 'cm4htz9hh003el806oat8fnet', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'));
INSERT INTO public."user_segment" VALUES ('cm4htz9hi003il806z7klcadx', 'cm4htz9hh003el806oat8fnet', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Uptown'));
INSERT INTO public."user_segment" VALUES ('cm4htz9hi003il806z7klcadx', 'cm4htz9hh003el806oat8fnet', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES ('cm4htz9hi003il806z7klcadx', 'cm4htz9hh003el806oat8fnet', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'));
INSERT INTO public."user_segment" VALUES ('cm4htz9hi003il806z7klcadx', 'cm4htz9hh003el806oat8fnet', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Camosun Interurban'));
INSERT INTO public."user_segment" VALUES ('cm605kwu4006cl806226h4jol', 'cm605kwu40068l806uyzrpx52', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES ('cm605kwu4006cl806226h4jol', 'cm605kwu40068l806uyzrpx52', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'));
INSERT INTO public."user_segment" VALUES ('cm605kwu4006cl806226h4jol', 'cm605kwu40068l806uyzrpx52', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Uptown'));
INSERT INTO public."user_segment" VALUES ('cm69jv70i0004uiapjcyfoaxs', 'cm69jv70g0000uiap1cw35gty', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES ('cm69jv70i0004uiapjcyfoaxs', 'cm69jv70g0000uiap1cw35gty', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'));
INSERT INTO public."user_segment" VALUES ('cm69jv70i0004uiapjcyfoaxs', 'cm69jv70g0000uiap1cw35gty', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES ('cm69jv70i0004uiapjcyfoaxs', 'cm69jv70g0000uiap1cw35gty', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'));
INSERT INTO public."user_segment" VALUES ('cm6eqv1ij0004lg06twpxdfjy', 'cm6eqv1ii0000lg06bw4zice6', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES ('cm6eqv1ij0004lg06twpxdfjy', 'cm6eqv1ii0000lg06bw4zice6', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Oak Bay'));
INSERT INTO public."user_segment" VALUES ('cm6eqv1ij0004lg06twpxdfjy', 'cm6eqv1ii0000lg06bw4zice6', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Cadboro Bay'));
INSERT INTO public."user_segment" VALUES ('cm6forp100004uiofkl14fwyi', 'cm6forp0y0000uiofp5k5l1qg', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES ('cm6forp100004uiofkl14fwyi', 'cm6forp0y0000uiofp5k5l1qg', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'));
INSERT INTO public."user_segment" VALUES ('cm6v18qri000elg06x9acdvxc', 'cm6v18qri000alg06awi67bsh', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES ('cm6v18qri000elg06x9acdvxc', 'cm6v18qri000alg06awi67bsh', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Victoria'));
INSERT INTO public."user_segment" VALUES ('cm6v18qri000elg06x9acdvxc', 'cm6v18qri000alg06awi67bsh', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Downtown'));
INSERT INTO public."user_segment" VALUES ('cm4h9p4k2001il806vexkgos0', 'cm4h9p4k1001el8067oolrsbb', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES ('cm4h9p4k2001il806vexkgos0', 'cm4h9p4k1001el8067oolrsbb', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Esquimalt'));
INSERT INTO public."user_segment" VALUES ('cm4h9p4k2001il806vexkgos0', 'cm4h9p4k1001el8067oolrsbb', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Esquimalt Village'));
INSERT INTO public."user_segment" VALUES ('cm4h9p4k2001il806vexkgos0', 'cm4h9p4k1001el8067oolrsbb', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES ('cm4h9p4k2001il806vexkgos0', 'cm4h9p4k1001el8067oolrsbb', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Langford'));
INSERT INTO public."user_segment" VALUES ('cm4h9p4k2001il806vexkgos0', 'cm4h9p4k1001el8067oolrsbb', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Goldstream Station'));
INSERT INTO public."user_segment" VALUES ('cm4ha0tva001sl806e9euqgw7', 'cm4ha0tva001ol806sqh2vuqa', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES ('cm4ha0tva001sl806e9euqgw7', 'cm4ha0tva001ol806sqh2vuqa', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Victoria'));
INSERT INTO public."user_segment" VALUES ('cm4ha0tva001sl806e9euqgw7', 'cm4ha0tva001ol806sqh2vuqa', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Downtown'));

*/

-- USER SEGMENTS WITH INTEGER ID's
INSERT INTO public."user_segment" VALUES (1, 'cm4hc2ydu002al806akxtnrsl', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES (2, 'cm4hc2ydu002al806akxtnrsl', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Victoria'));
INSERT INTO public."user_segment" VALUES (3, 'cm4hc2ydu002al806akxtnrsl', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Downtown'));
INSERT INTO public."user_segment" VALUES (4, 'cm4hkq0vv002kl806nfnhhvjf', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES (5, 'cm4hkq0vv002kl806nfnhhvjf', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Victoria'));
INSERT INTO public."user_segment" VALUES (6, 'cm4hkq0vv002kl806nfnhhvjf', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Downtown'));
INSERT INTO public."user_segment" VALUES (7, 'cm4hkq0vv002kl806nfnhhvjf', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES (8, 'cm4hkq0vv002kl806nfnhhvjf', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'));
INSERT INTO public."user_segment" VALUES (9, 'cm4hkq0vv002kl806nfnhhvjf', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'UVIC'));
INSERT INTO public."user_segment" VALUES (10, 'cm65wo2820074l8069221ul8j', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES (11, 'cm65wo2820074l8069221ul8j', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Victoria'));
INSERT INTO public."user_segment" VALUES (12, 'cm65wo2820074l8069221ul8j', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Fairfield'));
INSERT INTO public."user_segment" VALUES (13, 'cm65wo2820074l8069221ul8j', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES (14, 'cm65wo2820074l8069221ul8j', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Victoria'));
INSERT INTO public."user_segment" VALUES (15, 'cm65wo2820074l8069221ul8j', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES (16, 'cm65wo2820074l8069221ul8j', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'));
INSERT INTO public."user_segment" VALUES (17, 'cm65wo2820074l8069221ul8j', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'UVIC'));
INSERT INTO public."user_segment" VALUES (18, 'cm65vicnd006ul806fahzfmhr', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES (19, 'cm65vicnd006ul806fahzfmhr', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'));
INSERT INTO public."user_segment" VALUES (20, 'cm65vicnd006ul806fahzfmhr', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Uptown'));
INSERT INTO public."user_segment" VALUES (21, 'cm65vicnd006ul806fahzfmhr', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES (22, 'cm65vicnd006ul806fahzfmhr', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'));
INSERT INTO public."user_segment" VALUES (23, 'cm65vicnd006ul806fahzfmhr', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'UVIC'));
INSERT INTO public."user_segment" VALUES (24, 'cm65xdjtp007el806j5gwno25', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES (25, 'cm65xdjtp007el806j5gwno25', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Victoria'));
INSERT INTO public."user_segment" VALUES (26, 'cm4huzcea0048l806ll0dhddx', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES (27, 'cm4huzcea0048l806ll0dhddx', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Victoria'));
INSERT INTO public."user_segment" VALUES (28, 'cm4huzcea0048l806ll0dhddx', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Downtown'));
INSERT INTO public."user_segment" VALUES (29, 'cm4huzcea0048l806ll0dhddx', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES (30, 'cm4huzcea0048l806ll0dhddx', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'));
INSERT INTO public."user_segment" VALUES (31, 'cm4huzcea0048l806ll0dhddx', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Uptown'));
INSERT INTO public."user_segment" VALUES (32, 'cm4huzcea0048l806ll0dhddx', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES (33, 'cm4huzcea0048l806ll0dhddx', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'));
INSERT INTO public."user_segment" VALUES (34, 'cm4huzcea0048l806ll0dhddx', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Camosun Interurban'));
INSERT INTO public."user_segment" VALUES (35, 'cm4humete003yl806ffzxb4o9', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES (36, 'cm4humete003yl806ffzxb4o9', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Victoria'));
INSERT INTO public."user_segment" VALUES (37, 'cm4humete003yl806ffzxb4o9', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Downtown'));
INSERT INTO public."user_segment" VALUES (38, 'cm4humete003yl806ffzxb4o9', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES (39, 'cm4humete003yl806ffzxb4o9', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'));
INSERT INTO public."user_segment" VALUES (40, 'cm4humete003yl806ffzxb4o9', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Uptown'));
INSERT INTO public."user_segment" VALUES (41, 'cm4humete003yl806ffzxb4o9', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES (42, 'cm4humete003yl806ffzxb4o9', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'));
INSERT INTO public."user_segment" VALUES (43, 'cm4humete003yl806ffzxb4o9', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Camosun Interurban'));
INSERT INTO public."user_segment" VALUES (44, 'cm4hvkcbs004il806bzksqj0p', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES (45, 'cm4hvkcbs004il806bzksqj0p', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'));
INSERT INTO public."user_segment" VALUES (46, 'cm4hvkcbs004il806bzksqj0p', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'UVIC'));
INSERT INTO public."user_segment" VALUES (47, 'cm4i18z9g0054l806g4ujmesy', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES (48, 'cm4i18z9g0054l806g4ujmesy', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'));
INSERT INTO public."user_segment" VALUES (49, 'cm4i1b7fs005el806o3jhmt23', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES (50, 'cm4i1b7fs005el806o3jhmt23', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Victoria'));
INSERT INTO public."user_segment" VALUES (51, 'cm4i1dj6h005ol806wnw7vryk', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES (52, 'cm4i1dj6h005ol806wnw7vryk', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Esquimalt'));
INSERT INTO public."user_segment" VALUES (53, 'cm4i1f5jr005yl806cjc5jwc6', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES (54, 'cm4i1f5jr005yl806cjc5jwc6', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Langford'));
INSERT INTO public."user_segment" VALUES (55, 'cm4hlbbxo002ul8069lvnnj73', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES (56, 'cm4hlbbxo002ul8069lvnnj73', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Victoria'));
INSERT INTO public."user_segment" VALUES (57, 'cm4hlbbxo002ul8069lvnnj73', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Fairfield'));
INSERT INTO public."user_segment" VALUES (58, 'cm4hlbbxo002ul8069lvnnj73', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES (59, 'cm4hlbbxo002ul8069lvnnj73', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'));
INSERT INTO public."user_segment" VALUES (60, 'cm4hlbbxo002ul8069lvnnj73', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'UVIC'));
INSERT INTO public."user_segment" VALUES (61, 'cm65xh81d007ol8062w3m2vnl', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES (62, 'cm65xh81d007ol8062w3m2vnl', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Victoria'));
INSERT INTO public."user_segment" VALUES (63, 'cm4huch4e003ol806sp63ltf0', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES (64, 'cm4huch4e003ol806sp63ltf0', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'));
INSERT INTO public."user_segment" VALUES (65, 'cm4huch4e003ol806sp63ltf0', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES (66, 'cm4huch4e003ol806sp63ltf0', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'));
INSERT INTO public."user_segment" VALUES (67, 'cm4huch4e003ol806sp63ltf0', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'UVIC'));
INSERT INTO public."user_segment" VALUES (68, 'cm4hpmava0034l806d9nf2lzz', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES (69, 'cm4hpmava0034l806d9nf2lzz', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Esquimalt'));
INSERT INTO public."user_segment" VALUES (70, 'cm4hpmava0034l806d9nf2lzz', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Esquimalt Village'));
INSERT INTO public."user_segment" VALUES (71, 'cm4hpmava0034l806d9nf2lzz', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES (72, 'cm4hpmava0034l806d9nf2lzz', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'));
INSERT INTO public."user_segment" VALUES (73, 'cm4hpmava0034l806d9nf2lzz', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Uptown'));
INSERT INTO public."user_segment" VALUES (74, 'cm4hpmava0034l806d9nf2lzz', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES (75, 'cm4hpmava0034l806d9nf2lzz', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'));
INSERT INTO public."user_segment" VALUES (76, 'cm4hpmava0034l806d9nf2lzz', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'UVIC'));
INSERT INTO public."user_segment" VALUES (77, 'cm4htz9hh003el806oat8fnet', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES (78, 'cm4htz9hh003el806oat8fnet', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Esquimalt'));
INSERT INTO public."user_segment" VALUES (79, 'cm4htz9hh003el806oat8fnet', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Westbay Village'));
INSERT INTO public."user_segment" VALUES (80, 'cm4htz9hh003el806oat8fnet', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES (81, 'cm4htz9hh003el806oat8fnet', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'));
INSERT INTO public."user_segment" VALUES (82, 'cm4htz9hh003el806oat8fnet', 'WORK'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Uptown'));
INSERT INTO public."user_segment" VALUES (83, 'cm4htz9hh003el806oat8fnet', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES (84, 'cm4htz9hh003el806oat8fnet', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'));
INSERT INTO public."user_segment" VALUES (85, 'cm4htz9hh003el806oat8fnet', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Camosun Interurban'));
INSERT INTO public."user_segment" VALUES (86, 'cm605kwu40068l806uyzrpx52', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES (87, 'cm605kwu40068l806uyzrpx52', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'));
INSERT INTO public."user_segment" VALUES (88, 'cm605kwu40068l806uyzrpx52', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Uptown'));
INSERT INTO public."user_segment" VALUES (89, 'cm69jv70g0000uiap1cw35gty', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES (90, 'cm69jv70g0000uiap1cw35gty', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'));
INSERT INTO public."user_segment" VALUES (91, 'cm69jv70g0000uiap1cw35gty', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES (92, 'cm69jv70g0000uiap1cw35gty', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'));
INSERT INTO public."user_segment" VALUES (93, 'cm6eqv1ii0000lg06bw4zice6', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES (94, 'cm6eqv1ii0000lg06bw4zice6', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Oak Bay'));
INSERT INTO public."user_segment" VALUES (95, 'cm6eqv1ii0000lg06bw4zice6', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Cadboro Bay'));
INSERT INTO public."user_segment" VALUES (96, 'cm6forp0y0000uiofp5k5l1qg', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES (97, 'cm6forp0y0000uiofp5k5l1qg', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'));
INSERT INTO public."user_segment" VALUES (98, 'cm6v18qri000alg06awi67bsh', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES (99, 'cm6v18qri000alg06awi67bsh', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Victoria'));
INSERT INTO public."user_segment" VALUES (100, 'cm6v18qri000alg06awi67bsh', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Downtown'));
INSERT INTO public."user_segment" VALUES (101, 'cm4h9p4k1001el8067oolrsbb', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES (102, 'cm4h9p4k1001el8067oolrsbb', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Esquimalt'));
INSERT INTO public."user_segment" VALUES (103, 'cm4h9p4k1001el8067oolrsbb', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Esquimalt Village'));
INSERT INTO public."user_segment" VALUES (104, 'cm4h9p4k1001el8067oolrsbb', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES (105, 'cm4h9p4k1001el8067oolrsbb', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Langford'));
INSERT INTO public."user_segment" VALUES (106, 'cm4h9p4k1001el8067oolrsbb', 'SCHOOL'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Goldstream Station'));
INSERT INTO public."user_segment" VALUES (107, 'cm4ha0tva001ol806sqh2vuqa', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'CRD'));
INSERT INTO public."user_segment" VALUES (108, 'cm4ha0tva001ol806sqh2vuqa', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Victoria'));
INSERT INTO public."user_segment" VALUES (109, 'cm4ha0tva001ol806sqh2vuqa', 'HOME'::public."user_segment_relationship_type", (SELECT seg_id FROM public.segment WHERE segment_name = 'Downtown'));


--
-- TOC entry 3541 (class 0 OID 362255)
-- Dependencies: 225
-- Data for Name: advertisement; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.advertisement VALUES (1, 'cm4ha0tva001ol806sqh2vuqa', '2025-01-21 06:17:19.009', '2025-01-21 06:17:19.009', 'Local Pizza', 'BASIC', NULL, 'saanich', '1737440238593-pizza.jpeg', 'https://local-pizza.ca/', true);

--
-- TOC entry 3588 (class 0 OID 363440)
-- Dependencies: 272
-- Data for Name: bad_posting_behavior; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.bad_posting_behavior VALUES (2, 0, 1, false, NULL, NULL, 'cm4hvkcbs004il806bzksqj0p');

--
-- TOC entry 3552 (class 0 OID 362708)
-- Dependencies: 236
-- Data for Name: collaborator; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.collaborator VALUES (1, 5, 'cm4hkq0vv002kl806nfnhhvjf', 'unskilled', 'anything you need me for', '4 hours per week', '555-555-5555', '2024-12-28 03:09:36.775', '2024-12-28 03:09:36.775');
INSERT INTO public.collaborator VALUES (2, 8, 'cm65vicnd006ul806fahzfmhr', 'sdfsdf', 'sdfsdf', 'sdfsdf', '555-555-5555', '2025-01-21 02:59:40.461', '2025-01-21 02:59:40.461');
INSERT INTO public.collaborator VALUES (3, 7, 'cm4ha0tva001ol806sqh2vuqa', 'dfgfd', 'dfgd', 'fdgfd', 'dfgfdg', '2025-01-21 05:55:04.079', '2025-01-21 05:55:04.079');
INSERT INTO public.collaborator VALUES (4, 7, 'cm4huch4e003ol806sp63ltf0', 'lots', 'anything', 'anytime', '555-555-5555', '2025-02-09 21:25:27.155', '2025-02-09 21:25:27.155');

-- TOC entry 3556 (class 0 OID 362742)
-- Dependencies: 240
-- Data for Name: donors; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.donors VALUES (1, 7, 'cm4huch4e003ol806sp63ltf0', 'anything', '555-555-5555', '2025-02-09 21:27:06.845', '2025-02-09 21:27:06.845');


-- Data for Name: idea_segment; Type: TABLE DATA; Schema: public; Owner: postgres
--
INSERT INTO public.idea_segment (idea_id, "segmentId") VALUES
  (160, (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich')),
  (160, (SELECT seg_id FROM public.segment WHERE segment_name = 'UVIC')),
  (161, (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich')),
  (161, (SELECT seg_id FROM public.segment WHERE segment_name = 'UVIC')),
  (162, (SELECT seg_id FROM public.segment WHERE segment_name = 'Victoria')),
  (162, (SELECT seg_id FROM public.segment WHERE segment_name = 'Downtown')),
  (163, (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich')),
  (163, (SELECT seg_id FROM public.segment WHERE segment_name = 'UVIC')),
  (168, (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich')),
  (168, (SELECT seg_id FROM public.segment WHERE segment_name = 'Uptown')),
  (169, (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich')),
  (169, (SELECT seg_id FROM public.segment WHERE segment_name = 'UVIC')),
  (170, (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich')),
  (170, (SELECT seg_id FROM public.segment WHERE segment_name = 'UVIC')),
  (164, (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich')),
  (164, (SELECT seg_id FROM public.segment WHERE segment_name = 'UVIC')),
  (165, (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich')),
  (165, (SELECT seg_id FROM public.segment WHERE segment_name = 'UVIC')),
  (166, (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich')),
  (166, (SELECT seg_id FROM public.segment WHERE segment_name = 'UVIC')),
  (167, (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich')),
  (167, (SELECT seg_id FROM public.segment WHERE segment_name = 'Victoria')),
  (171, (SELECT seg_id FROM public.segment WHERE segment_name = 'Victoria')),
  (171, (SELECT seg_id FROM public.segment WHERE segment_name = 'Downtown')),
  (172, (SELECT seg_id FROM public.segment WHERE segment_name = 'Victoria')),
  (172, (SELECT seg_id FROM public.segment WHERE segment_name = 'Downtown')),
  (173, (SELECT seg_id FROM public.segment WHERE segment_name = 'Victoria')),
  (173, (SELECT seg_id FROM public.segment WHERE segment_name = 'Downtown')),
  (174, (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich')),
  (174, (SELECT seg_id FROM public.segment WHERE segment_name = 'UVIC'));



-- TOC entry 3525 (class 0 OID 362023)
-- Dependencies: 209
-- Data for Name: idea_address; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.idea_address VALUES (25, 160, '', '', '', '', '', '2024-12-27 23:20:19.823', '2024-12-27 23:20:19.823', NULL);
INSERT INTO public.idea_address VALUES (26, 161, '', '', '', '', '', '2024-12-27 23:59:20.687', '2024-12-27 23:59:20.687', NULL);
INSERT INTO public.idea_address VALUES (27, 162, '', '', '', '', '', '2024-12-28 03:04:37.734', '2024-12-28 03:04:37.734', NULL);
INSERT INTO public.idea_address VALUES (28, 163, '', '', '', '', '', '2024-12-31 21:13:30.975', '2024-12-31 21:13:30.975', NULL);
INSERT INTO public.idea_address VALUES (29, 164, '', '', '', '', '', '2025-01-17 02:05:40.278', '2025-01-17 02:05:40.278', NULL);
INSERT INTO public.idea_address VALUES (30, 165, '', '', '', '', '', '2025-01-17 02:09:45.334', '2025-01-17 02:09:45.334', NULL);
INSERT INTO public.idea_address VALUES (31, 166, '', '', '', '', '', '2025-01-17 02:13:36.087', '2025-01-17 02:13:36.087', NULL);
INSERT INTO public.idea_address VALUES (32, 167, '', '', '', '', '', '2025-01-17 02:18:28.533', '2025-01-17 02:18:28.533', NULL);
INSERT INTO public.idea_address VALUES (33, 168, '', '', '', '', '', '2025-01-17 02:47:34.86', '2025-01-17 02:47:34.86', NULL);
INSERT INTO public.idea_address VALUES (34, 169, '', '', '', '', '', '2025-01-17 02:56:51.196', '2025-01-17 02:56:51.196', NULL);
INSERT INTO public.idea_address VALUES (35, 170, '', '', '', '', '', '2025-01-21 03:06:20.755', '2025-01-21 03:06:20.755', NULL);
INSERT INTO public.idea_address VALUES (36, 171, '', '', '', '', '', '2025-01-21 05:51:13.684', '2025-01-21 05:51:13.684', NULL);
INSERT INTO public.idea_address VALUES (37, 172, '', '', '', '', '', '2025-01-21 06:05:57.312', '2025-01-21 06:05:57.312', NULL);
INSERT INTO public.idea_address VALUES (38, 173, '', '', '', '', '', '2025-01-27 23:51:49.196', '2025-01-27 23:51:49.196', NULL);
INSERT INTO public.idea_address VALUES (39, 174, '', '', '', '', '', '2025-02-10 02:58:21.571', '2025-02-10 02:58:21.571', NULL);


--
-- TOC entry 3535 (class 0 OID 362091)
-- Dependencies: 219
-- Data for Name: idea_comment; Type: TABLE DATA; Schema: public; Owner: postgres
--
INSERT INTO public.idea_comment VALUES (96, 161, 'cm4hvkcbs004il806bzksqj0p', 'Please submit as many ideas as you can think of that would be of interest to the community and could fit inside the allotted maximum budget.', true, NOW(), NOW(), false, 0, false, '2024-12-28 00:00:13.228', false, 'encouraging', '{"keyword1": "ideas", "keyword2": "submit", "keyword3": "community", "keyword4": "budget", "keyword5": "interest"}', 'positive', 46);
INSERT INTO public.idea_comment VALUES (97, 160, 'cm4hkq0vv002kl806nfnhhvjf', 'It would be fun to see a different types of varietals of plants instead of monoculture', true, NOW(), NOW(), false, 0, false, '2024-12-28 03:11:02.901', false, 'excited', '{"keyword1": "variety", "keyword2": "plants", "keyword3": "monoculture", "keyword4": "types", "keyword5": "fun"}', 'positive', 9);
INSERT INTO public.idea_comment VALUES (98, 162, 'cm4hkq0vv002kl806nfnhhvjf', 'There are lots of places we could put these boxes, and it would beautify the streets too.', true, NOW(), NOW(), false, 0, false, '2024-12-28 03:13:55.047', false, 'implying', '{"keyword1": "places", "keyword2": "beautify", "keyword3": "streets", "keyword4": "put", "keyword5": "too"}', 'positive', 6);
INSERT INTO public.idea_comment VALUES (99, 161, 'cm4hkq0vv002kl806nfnhhvjf', 'This is such a great idea!', true, NOW(), NOW(), false, 0, false, '2024-12-28 03:17:39.569', false, 'praise', '{"keyword1": "great", "keyword2": "idea", "keyword3": "such", "keyword4": "this |", "keyword5": "none"}', 'positive', 9);
INSERT INTO public.idea_comment VALUES (100, 164, 'cm4hkq0vv002kl806nfnhhvjf', 'Makes me want to walk around in the rain more!', true, NOW(), NOW(), false, 0, false, '2025-01-17 02:06:18.56', false, 'enthralls', '{"keyword1": "rain", "keyword2": "walk", "keyword3": "around", "keyword4": "more", "keyword5": "want"}', 'positive', 9);
INSERT INTO public.idea_comment VALUES (101, 164, 'cm4hpmava0034l806d9nf2lzz', 'I would totally use this service!', true, NOW(), NOW(), false, 0, false, '2025-01-17 02:20:36.071', false, 'like', '{"keyword1": "service", "keyword2": "use", "keyword3": "this", "keyword4": "totally", "keyword5": "would"}', 'positive', 76);
INSERT INTO public.idea_comment VALUES (102, 165, 'cm65vicnd006ul806fahzfmhr', 'It would be great to also have some heirloom varietals for planting', true, NOW(), NOW(), false, 0, false, '2025-01-21 02:52:44.626', false, 'happy', '{"keyword1": "heirloom", "keyword2": "varietals", "keyword3": "planting", "keyword4": "great", "keyword5": "to"}', 'positive', 23);
INSERT INTO public.idea_comment VALUES (103, 163, 'cm4huch4e003ol806sp63ltf0', 'This idea needs more information', true, NOW(), NOW(), false, 0, false, '2025-01-21 05:33:57.422', false, 'critiques', '{"keyword1": "idea", "keyword2": "information", "keyword3": "needs", "keyword4": "more", "keyword5": "discuss"}', 'negative', 67);
INSERT INTO public.idea_comment VALUES (104, 160, 'cm4huch4e003ol806sp63ltf0', 'I agree with this proposal', true, NOW(), NOW(), false, 0, false, '2025-01-21 05:35:27.721', false, 'approve', '{"keyword1": "agreement", "keyword2": "proposal", "keyword3": "support", "keyword4": "same", "keyword5": "idea"}', 'positive', 67);
INSERT INTO public.idea_comment VALUES (105, 171, 'cm4ha0tva001ol806sqh2vuqa', 'Having a low carbon bicycle pickup service would be a great way to do it', true, NOW(), NOW(), false, 0, false, '2025-01-21 05:53:57.93', false, 'encourages', '{"keyword1": "carbon", "keyword2": "bicycle", "keyword3": "pickup", "keyword4": "low", "keyword5": "service"}', 'positive', 108);
INSERT INTO public.idea_comment VALUES (106, 162, 'cm4ha0tva001ol806sqh2vuqa', 'Make sure that Jack the planter has booth.', true, NOW(), NOW(), false, 0, false, '2025-02-10 03:18:54.793', false, 'confirm', '{"keyword1": "planter", "keyword2": "booth", "keyword3": "jack", "keyword4": "ensure", "keyword5": "has"}', 'positive', 109);

--
-- TOC entry 3562 (class 0 OID 363084)
-- Dependencies: 246
-- Data for Name: idea_flag; Type: TABLE DATA; Schema: public; Owner: postgres
--
INSERT INTO public.idea_flag VALUES (2, 163, 'cm4huch4e003ol806sp63ltf0', false, 'Incomplete Submission (Requires Additional Details)');


--
-- TOC entry 3523 (class 0 OID 362013)
-- Dependencies: 207
-- Data for Name: idea_geo; Type: TABLE DATA; Schema: public; Owner: postgres
--
INSERT INTO public.idea_geo VALUES (29, 160, NULL, NULL, NOW(), NOW(), NULL);
INSERT INTO public.idea_geo VALUES (30, 161, NULL, NULL, NOW(), NOW(), NULL);
INSERT INTO public.idea_geo VALUES (31, 162, NULL, NULL, NOW(), NOW(), NULL);
INSERT INTO public.idea_geo VALUES (32, 163, NULL, NULL, NOW(), NOW(), NULL);
INSERT INTO public.idea_geo VALUES (33, 164, NULL, NULL, NOW(), NOW(), NULL);
INSERT INTO public.idea_geo VALUES (34, 165, NULL, NULL, NOW(), NOW(), NULL);
INSERT INTO public.idea_geo VALUES (35, 166, NULL, NULL, NOW(), NOW(), NULL);
INSERT INTO public.idea_geo VALUES (36, 167, NULL, NULL, NOW(), NOW(), NULL);
INSERT INTO public.idea_geo VALUES (37, 168, NULL, NULL, NOW(), NOW(), NULL);
INSERT INTO public.idea_geo VALUES (38, 169, NULL, NULL, NOW(), NOW(), NULL);
INSERT INTO public.idea_geo VALUES (39, 170, NULL, NULL, NOW(), NOW(), NULL);
INSERT INTO public.idea_geo VALUES (40, 171, NULL, NULL, NOW(), NOW(), NULL);
INSERT INTO public.idea_geo VALUES (41, 172, NULL, NULL, NOW(), NOW(), NULL);
INSERT INTO public.idea_geo VALUES (42, 173, NULL, NULL, NOW(), NOW(), NULL);
INSERT INTO public.idea_geo VALUES (43, 174, NULL, NULL, NOW(), NOW(), NULL);


--
-- TOC entry 3533 (class 0 OID 362077)
-- Dependencies: 217
-- Data for Name: idea_rating; Type: TABLE DATA; Schema: public; Owner: postgres
--
INSERT INTO public.idea_rating VALUES (44, 161, 'cm4hvkcbs004il806bzksqj0p', 2, '', NOW(), NOW());
INSERT INTO public.idea_rating VALUES (45, 162, 'cm4ha0tva001ol806sqh2vuqa', 2, '', NOW(), NOW());
INSERT INTO public.idea_rating VALUES (46, 160, 'cm4hkq0vv002kl806nfnhhvjf', 2, '', NOW(), NOW());
INSERT INTO public.idea_rating VALUES (47, 162, 'cm4hkq0vv002kl806nfnhhvjf', 1, '', NOW(), NOW());
INSERT INTO public.idea_rating VALUES (48, 161, 'cm4hkq0vv002kl806nfnhhvjf', 2, '', NOW(), NOW());
INSERT INTO public.idea_rating VALUES (49, 164, 'cm4hkq0vv002kl806nfnhhvjf', 2, '', NOW(), NOW());
INSERT INTO public.idea_rating VALUES (50, 165, 'cm4hkq0vv002kl806nfnhhvjf', 1, '', NOW(), NOW());
INSERT INTO public.idea_rating VALUES (51, 166, 'cm4hpmava0034l806d9nf2lzz', 2, '', NOW(), NOW());
INSERT INTO public.idea_rating VALUES (52, 167, 'cm4hpmava0034l806d9nf2lzz', 2, '', NOW(), NOW());
INSERT INTO public.idea_rating VALUES (53, 164, 'cm4hpmava0034l806d9nf2lzz', 2, '', NOW(), NOW());
INSERT INTO public.idea_rating VALUES (54, 163, 'cm4hpmava0034l806d9nf2lzz', -2, '', NOW(), NOW());
INSERT INTO public.idea_rating VALUES (55, 165, 'cm4hpmava0034l806d9nf2lzz', 2, '', NOW(), NOW());
INSERT INTO public.idea_rating VALUES (56, 169, 'cm4huch4e003ol806sp63ltf0', 2, '', NOW(), NOW());
INSERT INTO public.idea_rating VALUES (57, 167, 'cm4huch4e003ol806sp63ltf0', 2, '', NOW(), NOW());
INSERT INTO public.idea_rating VALUES (58, 164, 'cm65vicnd006ul806fahzfmhr', 1, '', NOW(), NOW());
INSERT INTO public.idea_rating VALUES (59, 165, 'cm65vicnd006ul806fahzfmhr', 2, '', NOW(), NOW());
INSERT INTO public.idea_rating VALUES (60, 168, 'cm65vicnd006ul806fahzfmhr', 2, '', NOW(), NOW());
INSERT INTO public.idea_rating VALUES (61, 169, 'cm65vicnd006ul806fahzfmhr', 0, '', NOW(), NOW());
INSERT INTO public.idea_rating VALUES (62, 166, 'cm65vicnd006ul806fahzfmhr', -1, '', NOW(), NOW());
INSERT INTO public.idea_rating VALUES (63, 164, 'cm65wo2820074l8069221ul8j', 1, '', NOW(), NOW());
INSERT INTO public.idea_rating VALUES (64, 162, 'cm4i1b7fs005el806o3jhmt23', 1, '', NOW(), NOW());
INSERT INTO public.idea_rating VALUES (65, 163, 'cm4huch4e003ol806sp63ltf0', -2, '', NOW(), NOW());
INSERT INTO public.idea_rating VALUES (66, 171, 'cm4ha0tva001ol806sqh2vuqa', 2, '', NOW(), NOW());
INSERT INTO public.idea_rating VALUES (67, 172, 'cm4ha0tva001ol806sqh2vuqa', 1, '', NOW(), NOW());
INSERT INTO public.idea_rating VALUES (68, 172, 'cm4hkq0vv002kl806nfnhhvjf', 2, '', NOW(), NOW());
INSERT INTO public.idea_rating VALUES (69, 161, 'cm4ha0tva001ol806sqh2vuqa', 1, '', NOW(), NOW());
INSERT INTO public.idea_rating VALUES (70, 163, 'cm69jv70g0000uiap1cw35gty', 2, '', NOW(), NOW());
INSERT INTO public.idea_rating VALUES (71, 162, 'cm4huch4e003ol806sp63ltf0', 1, '', NOW(), NOW());
INSERT INTO public.idea_rating VALUES (72, 164, 'cm4huch4e003ol806sp63ltf0', 2, '', NOW(), NOW());
INSERT INTO public.idea_rating VALUES (73, 174, 'cm4huch4e003ol806sp63ltf0', 2, '', NOW(), NOW());
INSERT INTO public.idea_rating VALUES (74, 164, 'cm4ha0tva001ol806sqh2vuqa', 2, '', NOW(), NOW());

--
-- TOC entry 3580 (class 0 OID 363367)
-- Dependencies: 264
-- Data for Name: link; Type: TABLE DATA; Schema: public; Owner: postgres
--

--
-- TOC entry 3531 (class 0 OID 362064)
-- Dependencies: 215
-- Data for Name: project; Type: TABLE DATA; Schema: public; Owner: postgres
--


--
-- TOC entry 3582 (class 0 OID 363379)
-- Dependencies: 266
-- Data for Name: public_community_business_profile; Type: TABLE DATA; Schema: public; Owner: postgres
--

--
-- TOC entry 3584 (class 0 OID 363392)
-- Dependencies: 268
-- Data for Name: public_municipal_profile; Type: TABLE DATA; Schema: public; Owner: postgres
--

--
-- TOC entry 3574 (class 0 OID 363248)
-- Dependencies: 258
-- Data for Name: quarantine_notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

--
-- TOC entry 3514 (class 0 OID 361937)
-- Dependencies: 198
-- Data for Name: report; Type: TABLE DATA; Schema: public; Owner: postgres
--

--
-- TOC entry 3592 (class 0 OID 363488)
-- Dependencies: 276
-- Data for Name: school_details; Type: TABLE DATA; Schema: public; Owner: postgres
--
INSERT INTO public.school_details VALUES (155, '', '', '', NULL, 'cm4h9p4k1001el8067oolrsbb', '2024-12-09 16:49:13.298', '2024-12-09 16:49:13.298', NULL, NULL);
INSERT INTO public.school_details VALUES (156, '', '', '', NULL, 'cm4ha0tva001ol806sqh2vuqa', '2024-12-09 16:58:19.318', '2024-12-09 16:58:19.318', NULL, NULL);
INSERT INTO public.school_details VALUES (157, '', '', '', NULL, 'cm4hc2ydu002al806akxtnrsl', '2024-12-09 17:55:57.715', '2024-12-09 17:55:57.715', NULL, NULL);
INSERT INTO public.school_details VALUES (158, 'Ring Road', 'V9A 555', 'Economics', '2026-04-10', 'cm4hkq0vv002kl806nfnhhvjf', '2024-12-09 21:57:50.971', '2024-12-09 21:57:50.971', NULL, NULL);
INSERT INTO public.school_details VALUES (159, '', '', '', NULL, 'cm4hlbbxo002ul8069lvnnj73', '2024-12-09 22:14:25.068', '2024-12-09 22:14:25.068', NULL, NULL);
INSERT INTO public.school_details VALUES (160, 'Ring Road', 'V9A 555', '', NULL, 'cm4hpmava0034l806d9nf2lzz', '2024-12-10 00:14:55.366', '2024-12-10 00:26:11.603', 'Mary', 'Literature');
INSERT INTO public.school_details VALUES (161, 'Interurban Road', 'V9A 555', '', NULL, 'cm4htz9hh003el806oat8fnet', '2024-12-10 02:16:58.566', '2024-12-10 02:22:40.971', 'Rudolf', 'Mechanical');
INSERT INTO public.school_details VALUES (163, 'Interurban Rd', 'V9A 555', '', NULL, 'cm4humete003yl806ffzxb4o9', '2024-12-10 02:34:58.563', '2024-12-10 02:41:34.448', 'Helen', 'Arts');
INSERT INTO public.school_details VALUES (164, 'Interurban Road', 'V9A 555', '', NULL, 'cm4huzcea0048l806ll0dhddx', '2024-12-10 02:45:01.955', '2024-12-10 02:58:37.703', 'Greta', 'Biology');
INSERT INTO public.school_details VALUES (165, '', '', '', NULL, 'cm4hvkcbs004il806bzksqj0p', '2024-12-10 03:01:21.64', '2024-12-10 03:01:21.64', NULL, NULL);
INSERT INTO public.school_details VALUES (166, '', '', '', '2024-12-10', 'cm4i18z9g0054l806g4ujmesy', '2024-12-10 05:40:29.188', '2024-12-10 05:40:29.188', NULL, NULL);
INSERT INTO public.school_details VALUES (167, '', '', '', '2024-12-10', 'cm4i1b7fs005el806o3jhmt23', '2024-12-10 05:42:13.096', '2024-12-10 05:42:13.096', NULL, NULL);
INSERT INTO public.school_details VALUES (168, '', '', '', '2024-12-10', 'cm4i1dj6h005ol806wnw7vryk', '2024-12-10 05:44:01.625', '2024-12-10 05:44:01.625', NULL, NULL);
INSERT INTO public.school_details VALUES (169, '', '', '', '2024-12-10', 'cm4i1f5jr005yl806cjc5jwc6', '2024-12-10 05:45:17.272', '2024-12-10 05:45:17.272', NULL, NULL);
INSERT INTO public.school_details VALUES (170, '', '', '', NULL, 'cm605kwu40068l806uyzrpx52', '2025-01-17 02:41:17.884', '2025-01-17 02:41:17.884', NULL, NULL);
INSERT INTO public.school_details VALUES (171, 'Ring Road', '555555', '', NULL, 'cm65vicnd006ul806fahzfmhr', '2025-01-21 02:45:59.306', '2025-01-21 02:51:03.768', 'Montgomery', 'Engineering');
INSERT INTO public.school_details VALUES (172, 'Ring Road', '555555', '', NULL, 'cm65wo2820074l8069221ul8j', '2025-01-21 03:18:25.347', '2025-01-21 03:22:52.124', 'Alexander', 'Engineering');
INSERT INTO public.school_details VALUES (173, '', '', '', '2025-01-21', 'cm65xdjtp007el806j5gwno25', '2025-01-21 03:38:14.557', '2025-01-21 03:38:14.557', NULL, NULL);
INSERT INTO public.school_details VALUES (174, '', '', '', '2025-01-21', 'cm65xh81d007ol8062w3m2vnl', '2025-01-21 03:41:05.906', '2025-01-21 03:41:05.906', NULL, NULL);
INSERT INTO public.school_details VALUES (162, 'sdfsd', 'sadsdsa', '', NULL, 'cm4huch4e003ol806sp63ltf0', '2024-12-10 02:27:14.991', '2025-01-23 18:20:41.525', 'sdfsdf', 'sdfsd');
INSERT INTO public.school_details VALUES (175, 'gdsa', 'gdas', '', NULL, 'cm69jv70g0000uiap1cw35gty', '2025-01-23 16:31:07.841', '2025-01-26 03:04:32.819', 'gda', 'gdsa');
INSERT INTO public.school_details VALUES (176, '', '', '', NULL, 'cm6eqv1ii0000lg06bw4zice6', '2025-01-27 07:45:48.907', '2025-01-27 07:45:48.907', NULL, NULL);
INSERT INTO public.school_details VALUES (177, '', '', '', NULL, 'cm6forp0y0000uiofp5k5l1qg', '2025-01-27 23:34:59.699', '2025-01-27 23:34:59.699', NULL, NULL);
INSERT INTO public.school_details VALUES (178, '', '', '', NULL, 'cm6v18qri000alg06awi67bsh', '2025-02-07 17:20:43.134', '2025-02-07 17:20:43.134', NULL, NULL);

--
-- TOC entry 3548 (class 0 OID 362353)
-- Dependencies: 232
-- Data for Name: segmentRequest; Type: TABLE DATA; Schema: public; Owner: postgres
--


-- user_handle
INSERT INTO public.user_handle (id, user_id, handle, user_segment_relationship_type) VALUES
(1, 'cluisf9fi004cqs062oko5671', 'Test@', 'HOME'::public."user_segment_relationship_type"),
(2, 'cm4h9p4k1001el8067oolrsbb', 'Nic@Drake Avenue', 'HOME'::public."user_segment_relationship_type"),
(3, 'cm4h9p4k1001el8067oolrsbb', 'Nic@BMT', 'SCHOOL'::public."user_segment_relationship_type"),
(4, 'cm4ha0tva001ol806sqh2vuqa', '@Broad St', 'WORK'::public."user_segment_relationship_type"),
(5, 'cm4hc2ydu002al806akxtnrsl', 'Nic@Johnson St', 'WORK'::public."user_segment_relationship_type"),
(6, 'cm4hc2ydu002al806akxtnrsl', 'Nic@Network Potential', 'SCHOOL'::public."user_segment_relationship_type"),
(7, 'cm4hkq0vv002kl806nfnhhvjf', 'Joseph@Sooke Road', 'HOME'::public."user_segment_relationship_type"),
(8, 'cm4hkq0vv002kl806nfnhhvjf', 'Joseph@Economics', 'SCHOOL'::public."user_segment_relationship_type"),
(9, 'cm4hkq0vv002kl806nfnhhvjf', 'Joseph@Noodle Box', 'WORK'::public."user_segment_relationship_type"),
(10, 'cm65wo2820074l8069221ul8j', 'Alexander@Beinn Bhreagh St', 'HOME'::public."user_segment_relationship_type"),
(11, 'cm65wo2820074l8069221ul8j', 'Alexander@Engineering', 'SCHOOL'::public."user_segment_relationship_type"),
(12, 'cm65wo2820074l8069221ul8j', 'Alexander@Telus', 'WORK'::public."user_segment_relationship_type"),
(13, 'cm65vicnd006ul806fahzfmhr', 'Montgomery@Endinburg St', 'HOME'::public."user_segment_relationship_type"),
(14, 'cm65vicnd006ul806fahzfmhr', 'Montgomery@Engineering', 'SCHOOL'::public."user_segment_relationship_type"),
(15, 'cm65vicnd006ul806fahzfmhr', 'Montgomery@Scotty Engineering Ltd.', 'WORK'::public."user_segment_relationship_type"),
(16, 'cm65xdjtp007el806j5gwno25', 'Virginia@', 'HOME'::public."user_segment_relationship_type"),
(17, 'cm4huzcea0048l806ll0dhddx', 'Greta@Superior St', 'HOME'::public."user_segment_relationship_type"),
(18, 'cm4huzcea0048l806ll0dhddx', 'Greta@Biology', 'SCHOOL'::public."user_segment_relationship_type"),
(19, 'cm4huzcea0048l806ll0dhddx', 'Greta@E-Cycle Victoria', 'WORK'::public."user_segment_relationship_type"),
(20, 'cm4humete003yl806ffzxb4o9', 'Helen@Fisgard St', 'HOME'::public."user_segment_relationship_type"),
(21, 'cm4humete003yl806ffzxb4o9', 'Helen@Arts', 'SCHOOL'::public."user_segment_relationship_type"),
(22, 'cm4humete003yl806ffzxb4o9', 'Helen@ScotiaBank', 'WORK'::public."user_segment_relationship_type"),
(23, 'cm4hvkcbs004il806bzksqj0p', '@Ring Road', 'SCHOOL'::public."user_segment_relationship_type"),
(24, 'cm4i18z9g0054l806g4ujmesy', 'Wildred@', 'HOME'::public."user_segment_relationship_type"),
(25, 'cm4i1b7fs005el806o3jhmt23', 'Brian@', 'HOME'::public."user_segment_relationship_type"),
(26, 'cm4i1dj6h005ol806wnw7vryk', 'Pierre@', 'HOME'::public."user_segment_relationship_type"),
(27, 'cm4i1f5jr005yl806cjc5jwc6', 'Stephen@', 'HOME'::public."user_segment_relationship_type"),
(28, 'cm4hlbbxo002ul8069lvnnj73', 'Marie@', 'HOME'::public."user_segment_relationship_type"),
(29, 'cm4hlbbxo002ul8069lvnnj73', 'Marie@Sciences', 'SCHOOL'::public."user_segment_relationship_type"),
(30, 'cm65xh81d007ol8062w3m2vnl', 'Pierre@', 'HOME'::public."user_segment_relationship_type"),
(31, 'cm4huch4e003ol806sp63ltf0', 'Sigmund@Moravia St', 'HOME'::public."user_segment_relationship_type"),
(32, 'cm4huch4e003ol806sp63ltf0', 'sdfsdf@sdfsd', 'WORK'::public."user_segment_relationship_type"),
(33, 'cm4huch4e003ol806sp63ltf0', 'Sigmund@Psychology', 'SCHOOL'::public."user_segment_relationship_type"),
(34, 'cm4hpmava0034l806d9nf2lzz', 'Mary@Bavaria St', 'HOME'::public."user_segment_relationship_type"),
(35, 'cm4hpmava0034l806d9nf2lzz', 'Mary@Literature', 'SCHOOL'::public."user_segment_relationship_type"),
(36, 'cm4hpmava0034l806d9nf2lzz', 'Mary@H&M Clothing', 'WORK'::public."user_segment_relationship_type"),
(37, 'cm4htz9hh003el806oat8fnet', 'Rudolf@Paris Avenue', 'HOME'::public."user_segment_relationship_type"),
(38, 'cm4htz9hh003el806oat8fnet', 'Rudolf@Mechanical', 'SCHOOL'::public."user_segment_relationship_type"),
(39, 'cm4htz9hh003el806oat8fnet', 'Rudolf@BestBuy', 'WORK'::public."user_segment_relationship_type"),
(40, 'cm605kwu40068l806uyzrpx52', '@Uptown Boulevard', 'HOME'::public."user_segment_relationship_type"),
(41, 'cm69jv70g0000uiap1cw35gty', 'Radmir@gdasgdsa', 'HOME'::public."user_segment_relationship_type"),
(42, 'cm69jv70g0000uiap1cw35gty', 'gda@gdsa', 'WORK'::public."user_segment_relationship_type"),
(43, 'cm69jv70g0000uiap1cw35gty', 'gdsa@gdas', 'SCHOOL'::public."user_segment_relationship_type"),
(44, 'cm6eqv1ii0000lg06bw4zice6', 'Sohee@Denbigh Ave', 'HOME'::public."user_segment_relationship_type"),
(45, 'cm6forp0y0000uiofp5k5l1qg', 'test@teststes', 'HOME'::public."user_segment_relationship_type"),
(46, 'cm6v18qri000alg06awi67bsh', 'Brian@street', 'HOME'::public."user_segment_relationship_type");


--
-- TOC entry 3518 (class 0 OID 361976)
-- Dependencies: 202
-- Data for Name: user_address; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.user_address VALUES (190, 'cm4h9p4k1001el8067oolrsbb', 'Drake Avenue', '', '', '', 'V9A 6K4', '2024-12-09 16:49:13.298', '2024-12-09 16:49:13.298');
INSERT INTO public.user_address VALUES (191, 'cm4ha0tva001ol806sqh2vuqa', 'Broad St', '', '', '', 'V8W 2A9', '2024-12-09 16:58:19.318', '2024-12-09 16:58:19.318');
INSERT INTO public.user_address VALUES (192, 'cm4hc2ydu002al806akxtnrsl', 'Johnson St', '', '', '', 'V8W 0B5', '2024-12-09 17:55:57.715', '2024-12-09 17:55:57.715');
INSERT INTO public.user_address VALUES (193, 'cm4hkq0vv002kl806nfnhhvjf', 'Sooke Road', '', '', '', 'V9A 555', '2024-12-09 21:57:50.971', '2024-12-09 21:57:50.971');
INSERT INTO public.user_address VALUES (194, 'cm4hlbbxo002ul8069lvnnj73', 'Radium Avenue', '', '', '', 'V9A 555', '2024-12-09 22:14:25.068', '2024-12-09 22:14:25.068');
INSERT INTO public.user_address VALUES (195, 'cm4hpmava0034l806d9nf2lzz', 'Bavaria St', '', '', '', 'V9A 555', '2024-12-10 00:14:55.366', '2024-12-10 00:14:55.366');
INSERT INTO public.user_address VALUES (196, 'cm4htz9hh003el806oat8fnet', 'Paris Avenue', '', '', '', 'V9A 555', '2024-12-10 02:16:58.566', '2024-12-10 02:16:58.566');
INSERT INTO public.user_address VALUES (197, 'cm4huch4e003ol806sp63ltf0', 'Moravia St', '', '', '', 'V9A 555', '2024-12-10 02:27:14.991', '2024-12-10 02:27:14.991');
INSERT INTO public.user_address VALUES (198, 'cm4humete003yl806ffzxb4o9', 'Fisgard St', '', '', '', 'V9A 555', '2024-12-10 02:34:58.563', '2024-12-10 02:34:58.563');
INSERT INTO public.user_address VALUES (199, 'cm4huzcea0048l806ll0dhddx', 'Superior St', '', '', '', 'V9A 555', '2024-12-10 02:45:01.955', '2024-12-10 02:50:50.822');
INSERT INTO public.user_address VALUES (200, 'cm4hvkcbs004il806bzksqj0p', 'Ring Road', '', '', '', 'V9A 555', '2024-12-10 03:01:21.64', '2024-12-10 03:01:21.64');
INSERT INTO public.user_address VALUES (201, 'cm4i18z9g0054l806g4ujmesy', '', '', '', '', '', '2024-12-10 05:40:29.188', '2024-12-10 05:40:29.188');
INSERT INTO public.user_address VALUES (202, 'cm4i1b7fs005el806o3jhmt23', '', '', '', '', '', '2024-12-10 05:42:13.096', '2024-12-10 05:42:13.096');
INSERT INTO public.user_address VALUES (203, 'cm4i1dj6h005ol806wnw7vryk', '', '', '', '', '', '2024-12-10 05:44:01.625', '2024-12-10 05:44:01.625');
INSERT INTO public.user_address VALUES (204, 'cm4i1f5jr005yl806cjc5jwc6', '', '', '', '', '', '2024-12-10 05:45:17.272', '2024-12-10 05:45:17.272');
INSERT INTO public.user_address VALUES (205, 'cm605kwu40068l806uyzrpx52', 'Uptown Boulevard', '', '', '', 'V9A 555', '2025-01-17 02:41:17.884', '2025-01-17 02:41:17.884');
INSERT INTO public.user_address VALUES (206, 'cm65vicnd006ul806fahzfmhr', 'Endinburg St', '', '', '', '555555', '2025-01-21 02:45:59.306', '2025-01-21 02:45:59.306');
INSERT INTO public.user_address VALUES (207, 'cm65wo2820074l8069221ul8j', 'Beinn Bhreagh St', '', '', '', '55555', '2025-01-21 03:18:25.347', '2025-01-21 03:20:51.196');
INSERT INTO public.user_address VALUES (208, 'cm65xdjtp007el806j5gwno25', '', '', '', '', '', '2025-01-21 03:38:14.557', '2025-01-21 03:38:14.557');
INSERT INTO public.user_address VALUES (209, 'cm65xh81d007ol8062w3m2vnl', '', '', '', '', '', '2025-01-21 03:41:05.906', '2025-01-21 03:41:05.906');
INSERT INTO public.user_address VALUES (210, 'cm69jv70g0000uiap1cw35gty', 'gdasgdsa', '', '', '', 'gdasgdsa', '2025-01-23 16:31:07.841', '2025-01-23 16:31:07.841');
INSERT INTO public.user_address VALUES (211, 'cm6eqv1ii0000lg06bw4zice6', '6176 Denbigh Ave', '', '', '', 'V5H3R5', '2025-01-27 07:45:48.907', '2025-01-27 07:45:48.907');
INSERT INTO public.user_address VALUES (212, 'cm6forp0y0000uiofp5k5l1qg', 'teststes', '', '', '', 'testest', '2025-01-27 23:34:59.699', '2025-01-27 23:34:59.699');
INSERT INTO public.user_address VALUES (213, 'cm6v18qri000alg06awi67bsh', '123 street', '', '', '', 'V5M 000', '2025-02-07 17:20:43.134', '2025-02-07 17:20:43.134');
INSERT INTO public.user_address VALUES (132, 'cluisf9fi004cqs062oko5671', 'Admin Road', '', '', '', '123 ABC', '2024-04-07 17:09:34.899', '2024-04-07 17:09:34.899');


--
-- TOC entry 3537 (class 0 OID 362203)
-- Dependencies: 221
-- Data for Name: user_comment_likes; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.user_comment_likes VALUES (23, 101, 'cm65wo2820074l8069221ul8j');
INSERT INTO public.user_comment_likes VALUES (24, 100, 'cm65wo2820074l8069221ul8j');
INSERT INTO public.user_comment_likes VALUES (26, 101, 'cm4huch4e003ol806sp63ltf0');
INSERT INTO public.user_comment_likes VALUES (28, 98, 'cm4huch4e003ol806sp63ltf0');
INSERT INTO public.user_comment_likes VALUES (29, 100, 'cm4huch4e003ol806sp63ltf0');
INSERT INTO public.user_comment_likes VALUES (30, 106, 'cm4ha0tva001ol806sqh2vuqa');

--
-- TOC entry 3516 (class 0 OID 361963)
-- Dependencies: 200
-- Data for Name: user_geo; Type: TABLE DATA; Schema: public; Owner: postgres
--
INSERT INTO public.user_geo VALUES (189, 'cm4h9p4k1001el8067oolrsbb', NULL, NULL, '2024-12-09 16:49:13.298', '2024-12-09 16:49:13.298', NULL, NULL, NULL, NULL);
INSERT INTO public.user_geo VALUES (190, 'cm4ha0tva001ol806sqh2vuqa', 48.427207760108030000000000000000, -123.365737337483500000000000000000, '2024-12-09 16:58:19.318', '2024-12-09 16:58:19.318', NULL, NULL, NULL, NULL);
INSERT INTO public.user_geo VALUES (191, 'cm4hc2ydu002al806akxtnrsl', NULL, NULL, '2024-12-09 17:55:57.715', '2024-12-09 17:55:57.715', NULL, NULL, NULL, NULL);
INSERT INTO public.user_geo VALUES (192, 'cm4hkq0vv002kl806nfnhhvjf', NULL, NULL, '2024-12-09 21:57:50.971', '2024-12-09 21:57:50.971', NULL, NULL, NULL, NULL);
INSERT INTO public.user_geo VALUES (193, 'cm4hlbbxo002ul8069lvnnj73', NULL, NULL, '2024-12-09 22:14:25.068', '2024-12-09 22:14:25.068', NULL, NULL, NULL, NULL);
INSERT INTO public.user_geo VALUES (194, 'cm4hpmava0034l806d9nf2lzz', NULL, NULL, '2024-12-10 00:14:55.366', '2024-12-10 00:14:55.366', NULL, NULL, NULL, NULL);
INSERT INTO public.user_geo VALUES (195, 'cm4htz9hh003el806oat8fnet', NULL, NULL, '2024-12-10 02:16:58.566', '2024-12-10 02:16:58.566', NULL, NULL, NULL, NULL);
INSERT INTO public.user_geo VALUES (196, 'cm4huch4e003ol806sp63ltf0', NULL, NULL, '2024-12-10 02:27:14.991', '2024-12-10 02:27:14.991', NULL, NULL, NULL, NULL);
INSERT INTO public.user_geo VALUES (197, 'cm4humete003yl806ffzxb4o9', NULL, NULL, '2024-12-10 02:34:58.563', '2024-12-10 02:34:58.563', NULL, NULL, NULL, NULL);
INSERT INTO public.user_geo VALUES (198, 'cm4huzcea0048l806ll0dhddx', NULL, NULL, '2024-12-10 02:45:01.955', '2024-12-10 02:45:01.955', NULL, NULL, NULL, NULL);
INSERT INTO public.user_geo VALUES (199, 'cm4hvkcbs004il806bzksqj0p', 48.458508045383180000000000000000, -123.360621820068400000000000000000, '2024-12-10 03:01:21.64', '2024-12-10 03:01:21.64', NULL, NULL, NULL, NULL);
INSERT INTO public.user_geo VALUES (200, 'cm4i18z9g0054l806g4ujmesy', NULL, NULL, '2024-12-10 05:40:29.188', '2024-12-10 05:40:29.188', NULL, NULL, NULL, NULL);
INSERT INTO public.user_geo VALUES (201, 'cm4i1b7fs005el806o3jhmt23', NULL, NULL, '2024-12-10 05:42:13.096', '2024-12-10 05:42:13.096', NULL, NULL, NULL, NULL);
INSERT INTO public.user_geo VALUES (202, 'cm4i1dj6h005ol806wnw7vryk', NULL, NULL, '2024-12-10 05:44:01.625', '2024-12-10 05:44:01.625', NULL, NULL, NULL, NULL);
INSERT INTO public.user_geo VALUES (203, 'cm4i1f5jr005yl806cjc5jwc6', NULL, NULL, '2024-12-10 05:45:17.272', '2024-12-10 05:45:17.272', NULL, NULL, NULL, NULL);
INSERT INTO public.user_geo VALUES (204, 'cm605kwu40068l806uyzrpx52', 48.455247092133600000000000000000, -123.374536435540800000000000000000, '2025-01-17 02:41:17.884', '2025-01-17 02:41:17.884', NULL, NULL, NULL, NULL);
INSERT INTO public.user_geo VALUES (205, 'cm65vicnd006ul806fahzfmhr', NULL, NULL, '2025-01-21 02:45:59.306', '2025-01-21 02:45:59.306', NULL, NULL, NULL, NULL);
INSERT INTO public.user_geo VALUES (206, 'cm65wo2820074l8069221ul8j', NULL, NULL, '2025-01-21 03:18:25.347', '2025-01-21 03:18:25.347', NULL, NULL, NULL, NULL);
INSERT INTO public.user_geo VALUES (207, 'cm65xdjtp007el806j5gwno25', NULL, NULL, '2025-01-21 03:38:14.557', '2025-01-21 03:38:14.557', NULL, NULL, NULL, NULL);
INSERT INTO public.user_geo VALUES (208, 'cm65xh81d007ol8062w3m2vnl', NULL, NULL, '2025-01-21 03:41:05.906', '2025-01-21 03:41:05.906', NULL, NULL, NULL, NULL);
INSERT INTO public.user_geo VALUES (209, 'cm69jv70g0000uiap1cw35gty', NULL, NULL, '2025-01-23 16:31:07.841', '2025-01-23 16:31:07.841', NULL, NULL, NULL, NULL);
INSERT INTO public.user_geo VALUES (210, 'cm6eqv1ii0000lg06bw4zice6', NULL, NULL, '2025-01-27 07:45:48.907', '2025-01-27 07:45:48.907', NULL, NULL, NULL, NULL);
INSERT INTO public.user_geo VALUES (211, 'cm6forp0y0000uiofp5k5l1qg', NULL, NULL, '2025-01-27 23:34:59.699', '2025-01-27 23:34:59.699', NULL, NULL, NULL, NULL);
INSERT INTO public.user_geo VALUES (212, 'cm6v18qri000alg06awi67bsh', NULL, NULL, '2025-02-07 17:20:43.134', '2025-02-07 17:20:43.134', NULL, NULL, NULL, NULL);
INSERT INTO public.user_geo VALUES (124, 'cluisf9fi004cqs062oko5671', NULL, NULL, '2024-04-02 19:44:08.574', '2024-04-02 19:44:08.574', NULL, NULL, NULL, NULL);

--
-- TOC entry 3578 (class 0 OID 363327)
-- Dependencies: 262
-- Data for Name: user_idea_endorse; Type: TABLE DATA; Schema: public; Owner: postgres
--
INSERT INTO public.user_idea_endorse VALUES (54, 'cm4i1b7fs005el806o3jhmt23', 162, '2025-01-21 03:41:49.412');
INSERT INTO public.user_idea_endorse VALUES (55, 'cm4ha0tva001ol806sqh2vuqa', 162, '2025-01-21 05:54:52.317');
INSERT INTO public.user_idea_endorse VALUES (56, 'cm4ha0tva001ol806sqh2vuqa', 172, '2025-01-21 06:06:28.73');

--
-- TOC entry 3560 (class 0 OID 362843)
-- Dependencies: 244
-- Data for Name: user_idea_follow; Type: TABLE DATA; Schema: public; Owner: postgres
--
INSERT INTO public.user_idea_follow VALUES (7, 'cm4hvkcbs004il806bzksqj0p', 161, '2024-12-28 00:00:31.861');
INSERT INTO public.user_idea_follow VALUES (8, 'cm4hpmava0034l806d9nf2lzz', 161, '2025-01-17 02:11:52.137');
INSERT INTO public.user_idea_follow VALUES (9, 'cm4huch4e003ol806sp63ltf0', 167, '2025-01-21 02:07:22.26');
INSERT INTO public.user_idea_follow VALUES (10, 'cm65vicnd006ul806fahzfmhr', 165, '2025-01-21 02:53:54.642');
INSERT INTO public.user_idea_follow VALUES (11, 'cm4i1b7fs005el806o3jhmt23', 162, '2025-01-21 03:41:51.936');
INSERT INTO public.user_idea_follow VALUES (12, 'cm4ha0tva001ol806sqh2vuqa', 172, '2025-01-21 06:06:29.754');
INSERT INTO public.user_idea_follow VALUES (14, 'cm4huch4e003ol806sp63ltf0', 164, '2025-02-10 02:48:09.714');

-- TOC entry 3558 (class 0 OID 362822)
-- Dependencies: 242
-- Data for Name: user_reach; Type: TABLE DATA; Schema: public; Owner: postgres
--
INSERT INTO public.user_reach VALUES ('cm4ha0tvb001ul8064oeora18', 'cm4ha0tva001ol806sqh2vuqa', (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'));
INSERT INTO public.user_reach VALUES ('cm4ha0tvb001vl8061ya7sust', 'cm4ha0tva001ol806sqh2vuqa', (SELECT seg_id FROM public.segment WHERE segment_name = 'Oak Bay'));
INSERT INTO public.user_reach VALUES ('cm4ha0tvb001wl806xhnlp9yj', 'cm4ha0tva001ol806sqh2vuqa', (SELECT seg_id FROM public.segment WHERE segment_name = 'Langford'));
INSERT INTO public.user_reach VALUES ('cm4ha0tvb001xl8062vut45q9', 'cm4ha0tva001ol806sqh2vuqa', (SELECT seg_id FROM public.segment WHERE segment_name = 'Victoria'));
INSERT INTO public.user_reach VALUES ('cm4ha0tvb001yl806qrwk02lo', 'cm4ha0tva001ol806sqh2vuqa', (SELECT seg_id FROM public.segment WHERE segment_name = 'Esquimalt'));
INSERT INTO public.user_reach VALUES ('cm4hvkcbt004ol8066vr75nwt', 'cm4hvkcbs004il806bzksqj0p', (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'));
INSERT INTO public.user_reach VALUES ('cm4hvkcbt004pl80657ma13n1', 'cm4hvkcbs004il806bzksqj0p', (SELECT seg_id FROM public.segment WHERE segment_name = 'Oak Bay'));
INSERT INTO public.user_reach VALUES ('cm4hvkcbt004ql8068ozzhwu8', 'cm4hvkcbs004il806bzksqj0p', (SELECT seg_id FROM public.segment WHERE segment_name = 'Langford'));
INSERT INTO public.user_reach VALUES ('cm4hvkcbt004rl80654psoik2', 'cm4hvkcbs004il806bzksqj0p', (SELECT seg_id FROM public.segment WHERE segment_name = 'Victoria'));
INSERT INTO public.user_reach VALUES ('cm4hvkcbt004sl80683qqtf8c', 'cm4hvkcbs004il806bzksqj0p', (SELECT seg_id FROM public.segment WHERE segment_name = 'Esquimalt'));
INSERT INTO public.user_reach VALUES ('cm605kwu4006el806z2sf02ia', 'cm605kwu40068l806uyzrpx52', (SELECT seg_id FROM public.segment WHERE segment_name = 'Saanich'));
INSERT INTO public.user_reach VALUES ('cm605kwu4006fl806qgx0gfh5', 'cm605kwu40068l806uyzrpx52', (SELECT seg_id FROM public.segment WHERE segment_name = 'Oak Bay'));
INSERT INTO public.user_reach VALUES ('cm605kwu4006gl806c3o9g7b9', 'cm605kwu40068l806uyzrpx52', (SELECT seg_id FROM public.segment WHERE segment_name = 'Langford'));
INSERT INTO public.user_reach VALUES ('cm605kwu4006hl806np5qf9aq', 'cm605kwu40068l806uyzrpx52', (SELECT seg_id FROM public.segment WHERE segment_name = 'Victoria'));
INSERT INTO public.user_reach VALUES ('cm605kwu4006il806x2rlv13i', 'cm605kwu40068l806uyzrpx52', (SELECT seg_id FROM public.segment WHERE segment_name = 'Esquimalt'));

--
-- TOC entry 3557 (class 0 OID 362807)
-- Dependencies: 241
-- Data for Name: user_stripe; Type: TABLE DATA; Schema: public; Owner: postgres
--
INSERT INTO public.user_stripe VALUES ('cm4ha0tva001ol806sqh2vuqa', 'cus_RMu50U4cLt8Zjf', 'incomplete');
INSERT INTO public.user_stripe VALUES ('cm4hvkcbs004il806bzksqj0p', 'cus_RN3ppZkPjuVzfA', 'incomplete');
INSERT INTO public.user_stripe VALUES ('cm605kwu40068l806uyzrpx52', 'cus_RbI4SL6jp9afgY', 'incomplete');

--
-- TOC entry 3554 (class 0 OID 362725)
-- Dependencies: 238
-- Data for Name: volunteer; Type: TABLE DATA; Schema: public; Owner: postgres
--
INSERT INTO public.volunteer VALUES (1, 7, 'cm4hkq0vv002kl806nfnhhvjf', 'none', 'anything', '1 hour per day', '555-555-5555', '2024-12-28 03:12:09.795', '2024-12-28 03:12:09.795');
INSERT INTO public.volunteer VALUES (2, 9, 'cm4ha0tva001ol806sqh2vuqa', 'df', 'df', 'dsf', 'sffds', '2025-01-21 06:06:14.352', '2025-01-21 06:06:14.352');

--
-- TOC entry 3594 (class 0 OID 363514)
-- Dependencies: 278
-- Data for Name: work_details; Type: TABLE DATA; Schema: public; Owner: postgres
--
INSERT INTO public.work_details VALUES (155, 'Peat Road', 'V9B 3V4', '', 'cm4h9p4k1001el8067oolrsbb', '2024-12-09 16:49:13.298', '2024-12-09 16:52:45.124', 'Nic', 'BMT');
INSERT INTO public.work_details VALUES (156, '', '', '', 'cm4ha0tva001ol806sqh2vuqa', '2024-12-09 16:58:19.318', '2024-12-09 16:58:19.318', NULL, NULL);
INSERT INTO public.work_details VALUES (157, 'Johnson St', 'V8W 0B5', 'Network Potential', 'cm4hc2ydu002al806akxtnrsl', '2024-12-09 17:55:57.715', '2024-12-09 17:55:57.715', NULL, NULL);
INSERT INTO public.work_details VALUES (158, 'Fisgard St', 'V9A 555', '', 'cm4hkq0vv002kl806nfnhhvjf', '2024-12-09 21:57:50.971', '2024-12-09 22:03:49.81', 'Joseph', 'Noodle Box');
INSERT INTO public.work_details VALUES (159, 'Ring Road', 'V9A 555', '', 'cm4hlbbxo002ul8069lvnnj73', '2024-12-09 22:14:25.068', '2024-12-09 22:18:08.179', 'Marie', 'Sciences');
INSERT INTO public.work_details VALUES (160, 'Uptown Blvd', 'V9A 555', '', 'cm4hpmava0034l806d9nf2lzz', '2024-12-10 00:14:55.366', '2024-12-10 00:25:09.854', 'Mary', 'H&M Clothing');
INSERT INTO public.work_details VALUES (161, 'Uptown Blvd', 'V9A 555', '', 'cm4htz9hh003el806oat8fnet', '2024-12-10 02:16:58.566', '2024-12-10 02:20:16.068', 'Rudolf', 'BestBuy');
INSERT INTO public.work_details VALUES (162, 'Ring Road', 'V9A 555', '', 'cm4huch4e003ol806sp63ltf0', '2024-12-10 02:27:14.991', '2024-12-10 02:29:44.268', 'Sigmund', 'Psychology');
INSERT INTO public.work_details VALUES (163, 'Blanchard St', 'V9A 555', '', 'cm4humete003yl806ffzxb4o9', '2024-12-10 02:34:58.563', '2024-12-10 02:39:34.298', 'Helen', 'ScotiaBank');
INSERT INTO public.work_details VALUES (164, 'Leslie Dr', 'V9A 555', '', 'cm4huzcea0048l806ll0dhddx', '2024-12-10 02:45:01.955', '2024-12-10 02:53:31.556', 'Greta', 'E-Cycle Victoria');
INSERT INTO public.work_details VALUES (165, '', '', '', 'cm4hvkcbs004il806bzksqj0p', '2024-12-10 03:01:21.64', '2024-12-10 03:01:21.64', NULL, NULL);
INSERT INTO public.work_details VALUES (166, '', '', '', 'cm4i18z9g0054l806g4ujmesy', '2024-12-10 05:40:29.188', '2024-12-10 05:40:29.188', NULL, NULL);
INSERT INTO public.work_details VALUES (167, '', '', '', 'cm4i1b7fs005el806o3jhmt23', '2024-12-10 05:42:13.096', '2024-12-10 05:42:13.096', NULL, NULL);
INSERT INTO public.work_details VALUES (168, '', '', '', 'cm4i1dj6h005ol806wnw7vryk', '2024-12-10 05:44:01.625', '2024-12-10 05:44:01.625', NULL, NULL);
INSERT INTO public.work_details VALUES (169, '', '', '', 'cm4i1f5jr005yl806cjc5jwc6', '2024-12-10 05:45:17.272', '2024-12-10 05:45:17.272', NULL, NULL);
INSERT INTO public.work_details VALUES (170, 'Uptown Boulevard', 'vadidi', 'Uptown Admin', 'cm605kwu40068l806uyzrpx52', '2025-01-17 02:41:17.884', '2025-01-17 02:41:17.884', NULL, NULL);
INSERT INTO public.work_details VALUES (171, 'Uptown Boulevard', '5555555', 'Scotty Engineering Ltd.', 'cm65vicnd006ul806fahzfmhr', '2025-01-21 02:45:59.306', '2025-01-21 02:45:59.306', NULL, NULL);
INSERT INTO public.work_details VALUES (172, 'Communications Avenue', 'ddddd', 'Telus', 'cm65wo2820074l8069221ul8j', '2025-01-21 03:18:25.347', '2025-01-21 03:18:25.347', NULL, NULL);
INSERT INTO public.work_details VALUES (173, '', '', '', 'cm65xdjtp007el806j5gwno25', '2025-01-21 03:38:14.557', '2025-01-21 03:38:14.557', NULL, NULL);
INSERT INTO public.work_details VALUES (174, '', '', '', 'cm65xh81d007ol8062w3m2vnl', '2025-01-21 03:41:05.906', '2025-01-21 03:41:05.906', NULL, NULL);
INSERT INTO public.work_details VALUES (175, 'gdsa', 'gdsa', '', 'cm69jv70g0000uiap1cw35gty', '2025-01-23 16:31:07.841', '2025-01-26 03:00:56.773', 'gdsa', 'gdas');
INSERT INTO public.work_details VALUES (90, '', '', '', 'cluisf9fi004cqs062oko5671', '2024-04-02 19:44:08.574', '2024-04-02 19:44:08.574', '', '');
INSERT INTO public.work_details VALUES (176, '', '', '', 'cm6eqv1ii0000lg06bw4zice6', '2025-01-27 07:45:48.907', '2025-01-27 07:45:48.907', NULL, NULL);
INSERT INTO public.work_details VALUES (177, '', '', '', 'cm6forp0y0000uiofp5k5l1qg', '2025-01-27 23:34:59.699', '2025-01-27 23:34:59.699', NULL, NULL);
INSERT INTO public.work_details VALUES (178, '', '', '', 'cm6v18qri000alg06awi67bsh', '2025-02-07 17:20:43.134', '2025-02-07 17:20:43.134', NULL, NULL);

COMMIT;

-- Run this line before debugging if there are errors
-- ROLLBACK;



