--
-- PostgreSQL database dump
--

-- Dumped from database version 15.13 (Debian 15.13-1.pgdg120+1)
-- Dumped by pg_dump version 15.13 (Debian 15.13-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: ai_module_course; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ai_module_course (id, title, description, created_at) FROM stdin;
2	ИМРС	Инженер моделирование распределительных сетей	2025-05-13 18:21:16.69522+00
5	Курс2	Тестовый курс	2025-05-21 09:14:35.520595+00
4	Курс3	Тестовый курс	2025-05-14 01:05:48.204329+00
\.


--
-- Data for Name: ai_module_group; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ai_module_group (id, name, created_at, course_id) FROM stdin;
1	24	2025-05-13 18:21:40.095041+00	2
\.


--
-- Data for Name: ai_module_aigroupreport; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ai_module_aigroupreport (id, report, created_at, course_id, group_id, is_latest) FROM stdin;
\.


--
-- Data for Name: ai_module_student; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ai_module_student (id, full_name, email, created_at) FROM stdin;
1	Алқабекұлы Амир	Amir@mail.ru	2025-05-13 18:21:34.957762+00
2	Ахметкалиев Ильяс Сакенулы	Ilias@mail.ru	2025-05-13 18:22:05.413985+00
\.


--
-- Data for Name: ai_module_aireport; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ai_module_aireport (id, report, created_at, course_id, student_id, is_latest) FROM stdin;
\.


--
-- Data for Name: ai_module_aiusagestats; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ai_module_aiusagestats (id, request_count, success_count, total_response_time, last_24h_requests, last_updated) FROM stdin;
1	0	0	0	0	2025-06-11 01:29:00.741348+00
\.


--
-- Data for Name: ai_module_topic; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ai_module_topic (id, name, description) FROM stdin;
1	Презентация концепции Цифрового РЭС	Практическая работа
2	Разработка документа "Постановка задачи на модерни	Практическая работа
4	Сбор исходных данных	Практическая работа
\.


--
-- Data for Name: ai_module_grade; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ai_module_grade (id, grade, comment, created_at, course_id, student_id, topic_id) FROM stdin;
1	3		2025-05-13 18:23:36.835581+00	2	1	1
2	3		2025-05-13 18:23:42.336151+00	2	1	2
3	3		2025-05-13 18:23:47.665443+00	2	1	4
4	4		2025-05-13 18:24:01.009601+00	2	2	1
6	3		2025-05-13 18:24:10.213059+00	2	2	2
7	5		2025-05-13 18:24:31.245099+00	2	2	4
\.


--
-- Data for Name: ai_module_studentcourse; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ai_module_studentcourse (id, course_id, student_id, group_id) FROM stdin;
1	2	1	1
2	2	2	1
\.


--
-- Data for Name: ai_module_user; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ai_module_user (id, password, last_login, is_superuser, email, full_name, role, is_active, is_staff, created_at) FROM stdin;
5	pbkdf2_sha256$1000000$QkLSLrF5Jc6WyTa6VDWZlj$SGuc0abFR7JsKtAMc8Qiwh5Z4aasld9rQ2+zhgoaKiY=	2025-06-11 00:06:51.708674+00	f	admin@mail.ru	admin	ADMIN	t	f	2025-06-11 00:06:42.382701+00
1	pbkdf2_sha256$1000000$UHkQUKoyhRpqJuTJk1LqFQ$0b6oFxwhIyMStszRJBD5V7pXKMPnF4y591N7M+fwQCo=	2025-06-11 00:59:51.061499+00	t	1admin@mail.ru	admin	ADMIN	t	t	2025-05-13 18:18:02.336704+00
4	pbkdf2_sha256$1000000$mjvk58ywTa9Bb25INI6UnI$Im9uG6S0dxNk7/qFnpYIS4l82MAHlhOg46HzPbQtERk=	2025-06-11 00:06:07.887313+00	f	curator@mail.ru	Куратор Кураторов	CURATOR	t	f	2025-06-11 00:05:19.305574+00
\.


--
-- Data for Name: auth_group; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.auth_group (id, name) FROM stdin;
\.


--
-- Data for Name: ai_module_user_groups; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ai_module_user_groups (id, user_id, group_id) FROM stdin;
\.


--
-- Data for Name: django_content_type; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.django_content_type (id, app_label, model) FROM stdin;
1	admin	logentry
2	auth	permission
3	auth	group
4	contenttypes	contenttype
5	sessions	session
6	ai_module	course
7	ai_module	student
8	ai_module	user
9	ai_module	grade
10	ai_module	aireport
11	ai_module	studentcourse
12	ai_module	usercourse
13	ai_module	topic
14	ai_module	aiusagestats
15	ai_module	group
16	ai_module	aigroupreport
\.


--
-- Data for Name: auth_permission; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.auth_permission (id, name, content_type_id, codename) FROM stdin;
1	Can add log entry	1	add_logentry
2	Can change log entry	1	change_logentry
3	Can delete log entry	1	delete_logentry
4	Can view log entry	1	view_logentry
5	Can add permission	2	add_permission
6	Can change permission	2	change_permission
7	Can delete permission	2	delete_permission
8	Can view permission	2	view_permission
9	Can add group	3	add_group
10	Can change group	3	change_group
11	Can delete group	3	delete_group
12	Can view group	3	view_group
13	Can add content type	4	add_contenttype
14	Can change content type	4	change_contenttype
15	Can delete content type	4	delete_contenttype
16	Can view content type	4	view_contenttype
17	Can add session	5	add_session
18	Can change session	5	change_session
19	Can delete session	5	delete_session
20	Can view session	5	view_session
21	Can add course	6	add_course
22	Can change course	6	change_course
23	Can delete course	6	delete_course
24	Can view course	6	view_course
25	Can add student	7	add_student
26	Can change student	7	change_student
27	Can delete student	7	delete_student
28	Can view student	7	view_student
29	Can add user	8	add_user
30	Can change user	8	change_user
31	Can delete user	8	delete_user
32	Can view user	8	view_user
33	Can add grade	9	add_grade
34	Can change grade	9	change_grade
35	Can delete grade	9	delete_grade
36	Can view grade	9	view_grade
37	Can add ai report	10	add_aireport
38	Can change ai report	10	change_aireport
39	Can delete ai report	10	delete_aireport
40	Can view ai report	10	view_aireport
41	Can add student course	11	add_studentcourse
42	Can change student course	11	change_studentcourse
43	Can delete student course	11	delete_studentcourse
44	Can view student course	11	view_studentcourse
45	Can add user course	12	add_usercourse
46	Can change user course	12	change_usercourse
47	Can delete user course	12	delete_usercourse
48	Can view user course	12	view_usercourse
49	Can add topic	13	add_topic
50	Can change topic	13	change_topic
51	Can delete topic	13	delete_topic
52	Can view topic	13	view_topic
53	Can add ai usage stats	14	add_aiusagestats
54	Can change ai usage stats	14	change_aiusagestats
55	Can delete ai usage stats	14	delete_aiusagestats
56	Can view ai usage stats	14	view_aiusagestats
57	Can add group	15	add_group
58	Can change group	15	change_group
59	Can delete group	15	delete_group
60	Can view group	15	view_group
61	Can add ai group report	16	add_aigroupreport
62	Can change ai group report	16	change_aigroupreport
63	Can delete ai group report	16	delete_aigroupreport
64	Can view ai group report	16	view_aigroupreport
\.


--
-- Data for Name: ai_module_user_user_permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ai_module_user_user_permissions (id, user_id, permission_id) FROM stdin;
\.


--
-- Data for Name: ai_module_usercourse; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ai_module_usercourse (id, course_id, user_id) FROM stdin;
5	2	4
\.


--
-- Data for Name: auth_group_permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.auth_group_permissions (id, group_id, permission_id) FROM stdin;
\.


--
-- Data for Name: django_admin_log; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.django_admin_log (id, action_time, object_id, object_repr, action_flag, change_message, content_type_id, user_id) FROM stdin;
1	2025-05-13 18:21:16.678227+00	1	ИМРС	1	[{"added": {}}]	6	1
2	2025-05-13 18:21:16.696267+00	2	ИМРС	1	[{"added": {}}]	6	1
3	2025-05-13 18:21:21.53063+00	1	ИМРС	3		6	1
4	2025-05-13 18:21:34.95845+00	1	Алқабекұлы Амир	1	[{"added": {}}]	7	1
5	2025-05-13 18:21:40.095821+00	1	24 (ИМРС)	1	[{"added": {}}]	15	1
6	2025-05-13 18:22:05.414519+00	2	Ахметкалиев Ильяс Сакенулы	1	[{"added": {}}]	7	1
7	2025-05-13 18:22:21.448585+00	1	Алқабекұлы Амир - ИМРС	1	[{"added": {}}]	11	1
8	2025-05-13 18:22:26.608057+00	2	Ахметкалиев Ильяс Сакенулы - ИМРС	1	[{"added": {}}]	11	1
9	2025-05-13 18:22:45.044613+00	1	Презентация концепции Цифрового РЭС	1	[{"added": {}}]	13	1
10	2025-05-13 18:23:00.513448+00	2	Разработка документа "Постановка задачи на модерни	1	[{"added": {}}]	13	1
11	2025-05-13 18:23:16.584423+00	3	Сбор исходных данных	1	[{"added": {}}]	13	1
12	2025-05-13 18:23:16.600276+00	4	Сбор исходных данных	1	[{"added": {}}]	13	1
13	2025-05-13 18:23:20.222738+00	3	Сбор исходных данных	3		13	1
14	2025-05-13 18:23:36.836589+00	1	Grade 3.0 for Алқабекұлы Амир in ИМРС	1	[{"added": {}}]	9	1
15	2025-05-13 18:23:42.337098+00	2	Grade 3.0 for Алқабекұлы Амир in ИМРС	1	[{"added": {}}]	9	1
16	2025-05-13 18:23:47.666079+00	3	Grade 3.0 for Алқабекұлы Амир in ИМРС	1	[{"added": {}}]	9	1
17	2025-05-13 18:24:01.010483+00	4	Grade 4.0 for Ахметкалиев Ильяс Сакенулы in ИМРС	1	[{"added": {}}]	9	1
18	2025-05-13 18:24:01.032608+00	5	Grade 4.0 for Ахметкалиев Ильяс Сакенулы in ИМРС	1	[{"added": {}}]	9	1
19	2025-05-13 18:24:04.233107+00	5	Grade 4.0 for Ахметкалиев Ильяс Сакенулы in ИМРС	3		9	1
20	2025-05-13 18:24:10.214206+00	6	Grade 3.0 for Ахметкалиев Ильяс Сакенулы in ИМРС	1	[{"added": {}}]	9	1
21	2025-05-13 18:24:31.24597+00	7	Grade 5.0 for Ахметкалиев Ильяс Сакенулы in ИМРС	1	[{"added": {}}]	9	1
22	2025-05-13 18:24:31.267289+00	8	Grade 5.0 for Ахметкалиев Ильяс Сакенулы in ИМРС	1	[{"added": {}}]	9	1
23	2025-05-13 18:24:40.213428+00	8	Grade 5.0 for Ахметкалиев Ильяс Сакенулы in ИМРС	3		9	1
24	2025-05-14 01:03:25.271045+00	1	Николай Петров - ИМРС	1	[{"added": {}}]	12	1
25	2025-05-14 01:04:10.349112+00	1	Николай Петров - ИМРС	3		12	1
26	2025-05-14 01:05:48.186884+00	3	Ядерная физика	1	[{"added": {}}]	6	1
27	2025-05-14 01:05:48.205667+00	4	Ядерная физика	1	[{"added": {}}]	6	1
28	2025-05-14 01:05:51.697339+00	3	Ядерная физика	3		6	1
29	2025-05-14 01:05:57.196646+00	2	Николай Петров - Ядерная физика	1	[{"added": {}}]	12	1
30	2025-05-21 09:14:35.534652+00	5	Курс3	1	[{"added": {}}]	6	1
31	2025-05-21 09:15:44.357934+00	3	Александр Федоров - Курс3	1	[{"added": {}}]	12	1
32	2025-05-21 09:15:44.387409+00	4	Александр Федоров - Курс3	1	[{"added": {}}]	12	1
33	2025-05-21 09:15:54.258916+00	3	Александр Федоров - Курс3	3		12	1
34	2025-06-06 13:39:46.18593+00	4	Курс2	2	[{"changed": {"fields": ["Title", "Description"]}}]	6	1
35	2025-06-06 13:40:36.991367+00	4	Курс3	2	[{"changed": {"fields": ["Title"]}}]	6	1
36	2025-06-06 13:40:51.866513+00	4	Курс2	2	[{"changed": {"fields": ["Title"]}}]	6	1
37	2025-06-06 13:41:08.981673+00	5	Курс2	2	[{"changed": {"fields": ["Title"]}}]	6	1
38	2025-06-06 13:41:08.999724+00	5	Курс2	2	[]	6	1
39	2025-06-06 13:41:13.212543+00	4	Курс3	2	[{"changed": {"fields": ["Title"]}}]	6	1
40	2025-06-11 00:01:45.269818+00	3	Александр Федоров (Куратор)	3		8	1
41	2025-06-11 00:01:45.269858+00	2	Николай Петров (Куратор)	3		8	1
42	2025-06-11 00:02:11.458159+00	1	Статистика AI: 0 запросов	2	[{"changed": {"fields": ["Request count", "Success count", "Total response time", "Last 24h requests"]}}]	14	1
43	2025-06-11 00:02:19.874243+00	49	AI Report for Ахметкалиев Ильяс Сакенулы in ИМРС	3		10	1
44	2025-06-11 00:02:19.874274+00	48	AI Report for Ахметкалиев Ильяс Сакенулы in ИМРС	3		10	1
45	2025-06-11 00:02:19.874291+00	47	AI Report for Ахметкалиев Ильяс Сакенулы in ИМРС	3		10	1
46	2025-06-11 00:02:19.874308+00	46	AI Report for Ахметкалиев Ильяс Сакенулы in ИМРС	3		10	1
47	2025-06-11 00:02:19.874322+00	45	AI Report for Ахметкалиев Ильяс Сакенулы in ИМРС	3		10	1
48	2025-06-11 00:02:19.874336+00	44	AI Report for Ахметкалиев Ильяс Сакенулы in ИМРС	3		10	1
49	2025-06-11 00:02:19.87435+00	43	AI Report for Ахметкалиев Ильяс Сакенулы in ИМРС	3		10	1
50	2025-06-11 00:02:19.874363+00	42	AI Report for Алқабекұлы Амир in ИМРС	3		10	1
51	2025-06-11 00:02:19.874375+00	41	AI Report for Алқабекұлы Амир in ИМРС	3		10	1
52	2025-06-11 00:02:19.874388+00	40	AI Report for Ахметкалиев Ильяс Сакенулы in ИМРС	3		10	1
53	2025-06-11 00:02:19.874401+00	39	AI Report for Ахметкалиев Ильяс Сакенулы in ИМРС	3		10	1
54	2025-06-11 00:02:19.874414+00	38	AI Report for Ахметкалиев Ильяс Сакенулы in ИМРС	3		10	1
55	2025-06-11 00:02:19.874426+00	37	AI Report for Алқабекұлы Амир in ИМРС	3		10	1
56	2025-06-11 00:02:19.874438+00	36	AI Report for Алқабекұлы Амир in ИМРС	3		10	1
57	2025-06-11 00:02:19.874451+00	35	AI Report for Ахметкалиев Ильяс Сакенулы in ИМРС	3		10	1
58	2025-06-11 00:02:19.874463+00	34	AI Report for Алқабекұлы Амир in ИМРС	3		10	1
59	2025-06-11 00:02:19.874476+00	33	AI Report for Алқабекұлы Амир in ИМРС	3		10	1
60	2025-06-11 00:02:19.874488+00	32	AI Report for Алқабекұлы Амир in ИМРС	3		10	1
61	2025-06-11 00:02:19.874501+00	31	AI Report for Алқабекұлы Амир in ИМРС	3		10	1
62	2025-06-11 00:02:19.874514+00	30	AI Report for Ахметкалиев Ильяс Сакенулы in ИМРС	3		10	1
63	2025-06-11 00:02:19.874526+00	29	AI Report for Алқабекұлы Амир in ИМРС	3		10	1
64	2025-06-11 00:02:19.874538+00	28	AI Report for Алқабекұлы Амир in ИМРС	3		10	1
65	2025-06-11 00:02:19.87455+00	27	AI Report for Алқабекұлы Амир in ИМРС	3		10	1
66	2025-06-11 00:02:19.874562+00	26	AI Report for Ахметкалиев Ильяс Сакенулы in ИМРС	3		10	1
67	2025-06-11 00:02:19.874575+00	25	AI Report for Алқабекұлы Амир in ИМРС	3		10	1
68	2025-06-11 00:02:19.874587+00	24	AI Report for Алқабекұлы Амир in ИМРС	3		10	1
69	2025-06-11 00:02:19.874599+00	23	AI Report for Алқабекұлы Амир in ИМРС	3		10	1
70	2025-06-11 00:02:19.874611+00	22	AI Report for Алқабекұлы Амир in ИМРС	3		10	1
71	2025-06-11 00:02:19.874623+00	21	AI Report for Алқабекұлы Амир in ИМРС	3		10	1
72	2025-06-11 00:02:19.874635+00	20	AI Report for Ахметкалиев Ильяс Сакенулы in ИМРС	3		10	1
73	2025-06-11 00:02:19.874647+00	19	AI Report for Алқабекұлы Амир in ИМРС	3		10	1
74	2025-06-11 00:02:19.874659+00	18	AI Report for Алқабекұлы Амир in ИМРС	3		10	1
75	2025-06-11 00:02:19.874671+00	17	AI Report for Алқабекұлы Амир in ИМРС	3		10	1
76	2025-06-11 00:02:19.874683+00	16	AI Report for Алқабекұлы Амир in ИМРС	3		10	1
77	2025-06-11 00:02:19.874695+00	15	AI Report for Алқабекұлы Амир in ИМРС	3		10	1
78	2025-06-11 00:02:19.874707+00	14	AI Report for Алқабекұлы Амир in ИМРС	3		10	1
79	2025-06-11 00:02:19.874719+00	13	AI Report for Алқабекұлы Амир in ИМРС	3		10	1
80	2025-06-11 00:02:19.874731+00	12	AI Report for Алқабекұлы Амир in ИМРС	3		10	1
81	2025-06-11 00:02:19.874743+00	11	AI Report for Алқабекұлы Амир in ИМРС	3		10	1
82	2025-06-11 00:02:19.874756+00	10	AI Report for Алқабекұлы Амир in ИМРС	3		10	1
83	2025-06-11 00:02:19.874769+00	9	AI Report for Алқабекұлы Амир in ИМРС	3		10	1
84	2025-06-11 00:02:19.874781+00	8	AI Report for Ахметкалиев Ильяс Сакенулы in ИМРС	3		10	1
85	2025-06-11 00:02:19.874794+00	7	AI Report for Ахметкалиев Ильяс Сакенулы in ИМРС	3		10	1
86	2025-06-11 00:02:19.874806+00	6	AI Report for Алқабекұлы Амир in ИМРС	3		10	1
87	2025-06-11 00:02:19.874819+00	5	AI Report for Ахметкалиев Ильяс Сакенулы in ИМРС	3		10	1
88	2025-06-11 00:02:19.874831+00	4	AI Report for Ахметкалиев Ильяс Сакенулы in ИМРС	3		10	1
89	2025-06-11 00:02:19.874856+00	3	AI Report for Алқабекұлы Амир in ИМРС	3		10	1
90	2025-06-11 00:02:19.874881+00	2	AI Report for Алқабекұлы Амир in ИМРС	3		10	1
91	2025-06-11 00:02:19.874896+00	1	AI Report for Алқабекұлы Амир in ИМРС	3		10	1
92	2025-06-11 00:02:25.588652+00	57	AI Group Report for 24 in ИМРС	3		16	1
93	2025-06-11 00:02:25.588694+00	56	AI Group Report for 24 in ИМРС	3		16	1
94	2025-06-11 00:02:25.58871+00	55	AI Group Report for 24 in ИМРС	3		16	1
95	2025-06-11 00:02:25.588726+00	54	AI Group Report for 24 in ИМРС	3		16	1
96	2025-06-11 00:02:25.588755+00	53	AI Group Report for 24 in ИМРС	3		16	1
97	2025-06-11 00:02:25.588772+00	52	AI Group Report for 24 in ИМРС	3		16	1
98	2025-06-11 00:02:25.588786+00	51	AI Group Report for 24 in ИМРС	3		16	1
99	2025-06-11 00:02:25.5888+00	50	AI Group Report for 24 in ИМРС	3		16	1
100	2025-06-11 00:02:25.588813+00	49	AI Group Report for 24 in ИМРС	3		16	1
101	2025-06-11 00:02:25.588826+00	48	AI Group Report for 24 in ИМРС	3		16	1
102	2025-06-11 00:02:25.588841+00	47	AI Group Report for 24 in ИМРС	3		16	1
103	2025-06-11 00:02:25.588854+00	46	AI Group Report for 24 in ИМРС	3		16	1
104	2025-06-11 00:02:25.588868+00	45	AI Group Report for 24 in ИМРС	3		16	1
105	2025-06-11 00:02:25.588881+00	44	AI Group Report for 24 in ИМРС	3		16	1
106	2025-06-11 00:02:25.588896+00	43	AI Group Report for 24 in ИМРС	3		16	1
107	2025-06-11 00:02:25.588909+00	42	AI Group Report for 24 in ИМРС	3		16	1
108	2025-06-11 00:02:25.588922+00	41	AI Group Report for 24 in ИМРС	3		16	1
109	2025-06-11 00:02:25.588936+00	40	AI Group Report for 24 in ИМРС	3		16	1
110	2025-06-11 00:02:25.588949+00	39	AI Group Report for 24 in ИМРС	3		16	1
111	2025-06-11 00:02:25.588962+00	38	AI Group Report for 24 in ИМРС	3		16	1
112	2025-06-11 00:02:25.588975+00	37	AI Group Report for 24 in ИМРС	3		16	1
113	2025-06-11 00:02:25.588989+00	36	AI Group Report for 24 in ИМРС	3		16	1
114	2025-06-11 00:02:25.589002+00	35	AI Group Report for 24 in ИМРС	3		16	1
115	2025-06-11 00:02:25.589015+00	34	AI Group Report for 24 in ИМРС	3		16	1
116	2025-06-11 00:02:25.589027+00	33	AI Group Report for 24 in ИМРС	3		16	1
117	2025-06-11 00:02:25.58904+00	32	AI Group Report for 24 in ИМРС	3		16	1
118	2025-06-11 00:02:25.589053+00	31	AI Group Report for 24 in ИМРС	3		16	1
119	2025-06-11 00:02:25.589066+00	30	AI Group Report for 24 in ИМРС	3		16	1
120	2025-06-11 00:02:25.589079+00	29	AI Group Report for 24 in ИМРС	3		16	1
121	2025-06-11 00:02:25.589092+00	28	AI Group Report for 24 in ИМРС	3		16	1
122	2025-06-11 00:02:25.589105+00	27	AI Group Report for 24 in ИМРС	3		16	1
123	2025-06-11 00:02:25.589119+00	26	AI Group Report for 24 in ИМРС	3		16	1
124	2025-06-11 00:02:25.589133+00	25	AI Group Report for 24 in ИМРС	3		16	1
125	2025-06-11 00:02:25.589146+00	24	AI Group Report for 24 in ИМРС	3		16	1
126	2025-06-11 00:02:25.58916+00	23	AI Group Report for 24 in ИМРС	3		16	1
127	2025-06-11 00:02:25.589173+00	22	AI Group Report for 24 in ИМРС	3		16	1
128	2025-06-11 00:02:25.589195+00	21	AI Group Report for 24 in ИМРС	3		16	1
129	2025-06-11 00:02:25.589208+00	20	AI Group Report for 24 in ИМРС	3		16	1
130	2025-06-11 00:02:25.589222+00	19	AI Group Report for 24 in ИМРС	3		16	1
131	2025-06-11 00:02:25.589236+00	18	AI Group Report for 24 in ИМРС	3		16	1
132	2025-06-11 00:02:25.589249+00	17	AI Group Report for 24 in ИМРС	3		16	1
133	2025-06-11 00:02:25.589262+00	16	AI Group Report for 24 in ИМРС	3		16	1
134	2025-06-11 00:02:25.589276+00	15	AI Group Report for 24 in ИМРС	3		16	1
135	2025-06-11 00:02:25.589289+00	14	AI Group Report for 24 in ИМРС	3		16	1
136	2025-06-11 00:02:25.589304+00	13	AI Group Report for 24 in ИМРС	3		16	1
137	2025-06-11 00:02:25.589317+00	12	AI Group Report for 24 in ИМРС	3		16	1
138	2025-06-11 00:02:25.589331+00	11	AI Group Report for 24 in ИМРС	3		16	1
139	2025-06-11 00:02:25.589344+00	10	AI Group Report for 24 in ИМРС	3		16	1
140	2025-06-11 00:02:25.589358+00	9	AI Group Report for 24 in ИМРС	3		16	1
141	2025-06-11 00:02:25.589371+00	8	AI Group Report for 24 in ИМРС	3		16	1
142	2025-06-11 00:02:25.589384+00	7	AI Group Report for 24 in ИМРС	3		16	1
143	2025-06-11 00:02:25.589398+00	6	AI Group Report for 24 in ИМРС	3		16	1
144	2025-06-11 00:02:25.589413+00	5	AI Group Report for 24 in ИМРС	3		16	1
145	2025-06-11 00:02:25.589427+00	4	AI Group Report for 24 in ИМРС	3		16	1
146	2025-06-11 00:02:25.589441+00	3	AI Group Report for 24 in ИМРС	3		16	1
147	2025-06-11 00:02:25.589454+00	2	AI Group Report for 24 in ИМРС	3		16	1
148	2025-06-11 00:02:25.589467+00	1	AI Group Report for 24 in ИМРС	3		16	1
149	2025-06-11 00:03:11.773347+00	1	Статистика AI: 0 запросов	2	[{"changed": {"fields": ["Request count", "Total response time", "Last 24h requests"]}}]	14	1
150	2025-06-11 00:05:43.386719+00	5	Куратор Кураторов - ИМРС	1	[{"added": {}}]	12	1
151	2025-06-11 00:05:55.482493+00	4	Куратор Кураторов (Куратор)	2	[{"changed": {"fields": ["Email"]}}]	8	1
152	2025-06-11 00:06:24.505193+00	1	admin (Администратор)	2	[{"changed": {"fields": ["Email"]}}]	8	1
153	2025-06-11 00:06:42.383693+00	5	admin (Администратор)	1	[{"added": {}}]	8	1
154	2025-06-11 00:07:06.629593+00	1	Статистика AI: 0 запросов	2	[{"changed": {"fields": ["Request count", "Total response time", "Last 24h requests"]}}]	14	1
155	2025-06-11 01:29:00.743522+00	1	Статистика AI: 0 запросов	2	[{"changed": {"fields": ["Request count", "Total response time", "Last 24h requests"]}}]	14	1
\.


--
-- Data for Name: django_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.django_migrations (id, app, name, applied) FROM stdin;
1	contenttypes	0001_initial	2025-05-13 18:13:32.620557+00
2	contenttypes	0002_remove_content_type_name	2025-05-13 18:13:32.626418+00
3	auth	0001_initial	2025-05-13 18:13:32.670499+00
4	auth	0002_alter_permission_name_max_length	2025-05-13 18:13:32.674886+00
5	auth	0003_alter_user_email_max_length	2025-05-13 18:13:32.679193+00
6	auth	0004_alter_user_username_opts	2025-05-13 18:13:32.684733+00
7	auth	0005_alter_user_last_login_null	2025-05-13 18:13:32.690892+00
8	auth	0006_require_contenttypes_0002	2025-05-13 18:13:32.69296+00
9	auth	0007_alter_validators_add_error_messages	2025-05-13 18:13:32.698311+00
10	auth	0008_alter_user_username_max_length	2025-05-13 18:13:32.702823+00
11	auth	0009_alter_user_last_name_max_length	2025-05-13 18:13:32.708011+00
12	auth	0010_alter_group_name_max_length	2025-05-13 18:13:32.714184+00
13	auth	0011_update_proxy_permissions	2025-05-13 18:13:32.71869+00
14	auth	0012_alter_user_first_name_max_length	2025-05-13 18:13:32.723296+00
15	ai_module	0001_initial	2025-05-13 18:13:32.832807+00
16	admin	0001_initial	2025-05-13 18:13:32.856727+00
17	admin	0002_logentry_remove_auto_add	2025-05-13 18:13:32.863799+00
18	admin	0003_logentry_add_action_flag_choices	2025-05-13 18:13:32.871287+00
19	ai_module	0002_alter_user_last_login	2025-05-13 18:13:32.879156+00
20	ai_module	0003_topic_grade_topic	2025-05-13 18:13:32.903307+00
21	ai_module	0004_aiusagestats	2025-05-13 18:13:32.908944+00
22	ai_module	0005_group_aigroupreport_studentcourse_group	2025-05-13 18:13:32.962817+00
23	ai_module	0006_alter_aiusagestats_options_aigroupreport_is_latest_and_more	2025-05-13 18:13:32.9791+00
24	sessions	0001_initial	2025-05-13 18:13:32.991419+00
\.


--
-- Data for Name: django_session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.django_session (session_key, session_data, expire_date) FROM stdin;
7vpqch0fomt2z8svj3bsfey2qqznlv6v	.eJxVjEEOwiAQAP_C2RAoLFaP3vsGsmV3pWogKe3J-HdD0oNeZybzVhH3Lce98RoXUldl1emXzZieXLqgB5Z71amWbV1m3RN92KanSvy6He3fIGPLfesHMiERkEgwSNaPowW6iJPE4pAhgU8MYsEFMWR8sI7P4CwYNwCqzxfz6DfD:1uEuCk:XDNJoAc4XFbYtPCYj42qokiXv8QJYf4E5pnZXAfg3ME	2025-05-27 18:18:14.331821+00
qqida6ft3l2ci579e7skvhct5vbwptrq	.eJxVjEEOwiAQAP_C2RAoLFaP3vsGsmV3pWogKe3J-HdD0oNeZybzVhH3Lce98RoXUldl1emXzZieXLqgB5Z71amWbV1m3RN92KanSvy6He3fIGPLfesHMiERkEgwSNaPowW6iJPE4pAhgU8MYsEFMWR8sI7P4CwYNwCqzxfz6DfD:1uF0Wl:XY9N-wdtPZGlDDWzm49F5vKP3WPJhWHF9ushHFW2Llg	2025-05-28 01:03:19.596496+00
3t6z5fuh2lqpo6zbveduw2cdhobdgy3d	.eJxVjEEOwiAQAP_C2RAoLFaP3vsGsmV3pWogKe3J-HdD0oNeZybzVhH3Lce98RoXUldl1emXzZieXLqgB5Z71amWbV1m3RN92KanSvy6He3fIGPLfesHMiERkEgwSNaPowW6iJPE4pAhgU8MYsEFMWR8sI7P4CwYNwCqzxfz6DfD:1uNX7i:adYrFacuFG8_GBiiPwukMfIBQ-IMISimRpMFGPIwFqE	2025-06-20 13:28:42.161475+00
y5i846xy1bqjhmjz2qznycekosi4g673	.eJxVjEEOwiAQAP_C2RAoLFaP3vsGsmV3pWogKe3J-HdD0oNeZybzVhH3Lce98RoXUldl1emXzZieXLqgB5Z71amWbV1m3RN92KanSvy6He3fIGPLfesHMiERkEgwSNaPowW6iJPE4pAhgU8MYsEFMWR8sI7P4CwYNwCqzxfz6DfD:1uP9ol:OXqyBl1gyxIX8jlnk4yZ0tw-svHx_r4RThmNrFIJl3c	2025-06-25 00:59:51.064171+00
\.


--
-- Name: ai_module_aigroupreport_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ai_module_aigroupreport_id_seq', 57, true);


--
-- Name: ai_module_aireport_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ai_module_aireport_id_seq', 49, true);


--
-- Name: ai_module_aiusagestats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ai_module_aiusagestats_id_seq', 1, false);


--
-- Name: ai_module_course_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ai_module_course_id_seq', 5, true);


--
-- Name: ai_module_grade_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ai_module_grade_id_seq', 8, true);


--
-- Name: ai_module_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ai_module_group_id_seq', 1, true);


--
-- Name: ai_module_student_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ai_module_student_id_seq', 2, true);


--
-- Name: ai_module_studentcourse_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ai_module_studentcourse_id_seq', 2, true);


--
-- Name: ai_module_topic_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ai_module_topic_id_seq', 4, true);


--
-- Name: ai_module_user_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ai_module_user_groups_id_seq', 1, false);


--
-- Name: ai_module_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ai_module_user_id_seq', 5, true);


--
-- Name: ai_module_user_user_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ai_module_user_user_permissions_id_seq', 1, false);


--
-- Name: ai_module_usercourse_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ai_module_usercourse_id_seq', 5, true);


--
-- Name: auth_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.auth_group_id_seq', 1, false);


--
-- Name: auth_group_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.auth_group_permissions_id_seq', 1, false);


--
-- Name: auth_permission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.auth_permission_id_seq', 64, true);


--
-- Name: django_admin_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.django_admin_log_id_seq', 155, true);


--
-- Name: django_content_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.django_content_type_id_seq', 16, true);


--
-- Name: django_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.django_migrations_id_seq', 24, true);


--
-- PostgreSQL database dump complete
--

