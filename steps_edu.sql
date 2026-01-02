--
-- PostgreSQL database dump
--

\restrict ioFJEJP8hTshGwTBu48dtFQcO83klN3LSoCWgvAmSWv8mWkYzZjTgj04RBJC9G3

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admins (
    id integer NOT NULL,
    email character varying(150) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(20) DEFAULT 'ADMIN'::character varying,
    status boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.admins OWNER TO postgres;

--
-- Name: admins_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admins_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admins_id_seq OWNER TO postgres;

--
-- Name: admins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admins_id_seq OWNED BY public.admins.id;


--
-- Name: courses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.courses (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer,
    status character varying(20) DEFAULT 'active'::character varying,
    CONSTRAINT courses_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'archived'::character varying])::text[])))
);


ALTER TABLE public.courses OWNER TO postgres;

--
-- Name: courses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.courses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.courses_id_seq OWNER TO postgres;

--
-- Name: courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.courses_id_seq OWNED BY public.courses.id;


--
-- Name: homework_files; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.homework_files (
    id integer NOT NULL,
    lesson_id integer NOT NULL,
    file_name character varying(255) NOT NULL,
    original_name character varying(255) NOT NULL,
    file_path text NOT NULL,
    file_type character varying(50) NOT NULL,
    file_size bigint NOT NULL,
    mime_type character varying(100),
    uploaded_by integer,
    due_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.homework_files OWNER TO postgres;

--
-- Name: homework_files_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.homework_files_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.homework_files_id_seq OWNER TO postgres;

--
-- Name: homework_files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.homework_files_id_seq OWNED BY public.homework_files.id;


--
-- Name: lessons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lessons (
    id integer NOT NULL,
    module_id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    content text,
    order_index integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer,
    status character varying(20) DEFAULT 'active'::character varying,
    ppt_file_path text,
    quiz_link text,
    CONSTRAINT lessons_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'archived'::character varying])::text[])))
);


ALTER TABLE public.lessons OWNER TO postgres;

--
-- Name: lessons_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lessons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lessons_id_seq OWNER TO postgres;

--
-- Name: lessons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lessons_id_seq OWNED BY public.lessons.id;


--
-- Name: modules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.modules (
    id integer NOT NULL,
    course_id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    order_index integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer,
    status character varying(20) DEFAULT 'active'::character varying,
    ppt_file_path text,
    quiz_link text,
    CONSTRAINT modules_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'archived'::character varying])::text[])))
);


ALTER TABLE public.modules OWNER TO postgres;

--
-- Name: modules_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.modules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.modules_id_seq OWNER TO postgres;

--
-- Name: modules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.modules_id_seq OWNED BY public.modules.id;


--
-- Name: student_files; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_files (
    id integer NOT NULL,
    lesson_id integer NOT NULL,
    file_name character varying(255) NOT NULL,
    original_name character varying(255) NOT NULL,
    file_path text NOT NULL,
    file_type character varying(50) NOT NULL,
    file_size bigint NOT NULL,
    mime_type character varying(100),
    student_id integer,
    uploaded_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'submitted'::character varying,
    CONSTRAINT student_files_status_check CHECK (((status)::text = ANY ((ARRAY['submitted'::character varying, 'graded'::character varying, 'returned'::character varying])::text[])))
);


ALTER TABLE public.student_files OWNER TO postgres;

--
-- Name: student_files_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.student_files_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.student_files_id_seq OWNER TO postgres;

--
-- Name: student_files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.student_files_id_seq OWNED BY public.student_files.id;


--
-- Name: teacher_files; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teacher_files (
    id integer NOT NULL,
    lesson_id integer NOT NULL,
    file_name character varying(255) NOT NULL,
    original_name character varying(255) NOT NULL,
    file_path text NOT NULL,
    file_type character varying(50) NOT NULL,
    file_size bigint NOT NULL,
    mime_type character varying(100),
    uploaded_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.teacher_files OWNER TO postgres;

--
-- Name: teacher_files_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.teacher_files_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.teacher_files_id_seq OWNER TO postgres;

--
-- Name: teacher_files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.teacher_files_id_seq OWNED BY public.teacher_files.id;


--
-- Name: admins id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins ALTER COLUMN id SET DEFAULT nextval('public.admins_id_seq'::regclass);


--
-- Name: courses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses ALTER COLUMN id SET DEFAULT nextval('public.courses_id_seq'::regclass);


--
-- Name: homework_files id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.homework_files ALTER COLUMN id SET DEFAULT nextval('public.homework_files_id_seq'::regclass);


--
-- Name: lessons id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons ALTER COLUMN id SET DEFAULT nextval('public.lessons_id_seq'::regclass);


--
-- Name: modules id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modules ALTER COLUMN id SET DEFAULT nextval('public.modules_id_seq'::regclass);


--
-- Name: student_files id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_files ALTER COLUMN id SET DEFAULT nextval('public.student_files_id_seq'::regclass);


--
-- Name: teacher_files id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_files ALTER COLUMN id SET DEFAULT nextval('public.teacher_files_id_seq'::regclass);


--
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admins (id, email, password, role, status, created_at) FROM stdin;
1	admin@example.com	$2b$12$lwrpCBtp5SEOGB5uoxZf9OlxKa2luslsmNo99iuFvqrDz9lVjJNzi	ADMIN	t	2025-12-30 11:49:37.01801
2	stepsadmin@gmail.com	$2b$12$lwrpCBtp5SEOGB5uoxZf9OlxKa2luslsmNo99iuFvqrDz9lVjJNzi	ADMIN	t	2025-12-30 11:59:42.052575
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.courses (id, title, description, created_at, updated_at, created_by, status) FROM stdin;
1	www	ee	2025-12-31 08:41:33.702539	2025-12-31 08:41:33.702539	1	archived
2	Strm Robotics	Strm Robotics	2025-12-31 10:36:22.330318	2025-12-31 10:36:22.330318	1	archived
3	Steps	Steps	2025-12-31 10:45:25.940594	2025-12-31 10:45:25.940594	1	archived
4	Vex 123	Vex 123	2025-12-31 11:52:01.243483	2025-12-31 11:52:01.243483	1	active
\.


--
-- Data for Name: homework_files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.homework_files (id, lesson_id, file_name, original_name, file_path, file_type, file_size, mime_type, uploaded_by, due_date, created_at) FROM stdin;
1	1	1767151432945_v9nrkrroqfd.pdf	Website Development Proposal for SET.pdf	/uploads/homework-files/1767151432945_v9nrkrroqfd.pdf	pdf	165091	application/pdf	1	\N	2025-12-31 08:53:52.953879
2	2	1767157690088_s7rwgwinfk.pdf	1767151413828_unct075e1ak.pdf	/uploads/homework-files/1767157690088_s7rwgwinfk.pdf	pdf	165091	application/pdf	1	\N	2025-12-31 10:38:10.09377
4	3	1767337915896_5lbeehpgomh.pdf	phase 1 level 1 123 lesson 1-Teacher Document.pdf	/uploads/homework-files/1767337915896_5lbeehpgomh.pdf	pdf	1981848	application/pdf	1	\N	2026-01-02 12:41:55.906881
\.


--
-- Data for Name: lessons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lessons (id, module_id, title, description, content, order_index, created_at, updated_at, created_by, status, ppt_file_path, quiz_link) FROM stdin;
1	1	rrr	ggg	gggg	1	2025-12-31 08:52:47.426169	2025-12-31 08:52:47.426169	1	active	\N	\N
2	2	Lesson1	Lesson1	Lesson1	1	2025-12-31 10:37:10.193992	2025-12-31 10:37:10.193992	1	active	\N	\N
3	4	What is a Robot and robotics	What is a Robot and robotics	\N	1	2025-12-31 11:52:30.986954	2026-01-02 12:29:04.001192	1	active	/uploads/lesson-files/1767335686895_a6hpxtn1hzm.pptx	https://www.stepsrobotics.com
\.


--
-- Data for Name: modules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.modules (id, course_id, title, description, order_index, created_at, updated_at, created_by, status, ppt_file_path, quiz_link) FROM stdin;
1	1	Poo	hhh	1	2025-12-31 08:52:21.257448	2025-12-31 08:52:21.257448	1	active	\N	\N
2	2	Module 1	Module 1	1	2025-12-31 10:36:36.893901	2025-12-31 10:36:36.893901	1	active	\N	\N
3	2	Module 2	Module 2	2	2025-12-31 10:36:53.123605	2025-12-31 10:36:53.123605	1	active	\N	\N
4	4	Module 1	Module 1	1	2025-12-31 11:52:15.968332	2025-12-31 11:52:15.968332	1	active	\N	\N
\.


--
-- Data for Name: student_files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_files (id, lesson_id, file_name, original_name, file_path, file_type, file_size, mime_type, student_id, uploaded_by, created_at, status) FROM stdin;
1	1	1767151413828_unct075e1ak.pdf	Website Development Proposal for SET.pdf	/uploads/student-files/1767151413828_unct075e1ak.pdf	pdf	165091	application/pdf	\N	1	2025-12-31 08:53:33.83828	submitted
2	2	1767157663096_tvd9b1ge3hc.pdf	1767151413828_unct075e1ak.pdf	/uploads/student-files/1767157663096_tvd9b1ge3hc.pdf	pdf	165091	application/pdf	\N	1	2025-12-31 10:37:43.099689	submitted
4	3	1767337246086_oza2xw3kdm.pdf	phase 1 level 1 123 lesson 1-Teacher Document.pdf	/uploads/student-files/1767337246086_oza2xw3kdm.pdf	pdf	1981848	application/pdf	\N	1	2026-01-02 12:30:46.107252	submitted
\.


--
-- Data for Name: teacher_files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teacher_files (id, lesson_id, file_name, original_name, file_path, file_type, file_size, mime_type, uploaded_by, created_at) FROM stdin;
1	1	1767151396003_5h3we1f4a7c.pdf	Website Development Proposal for SET.pdf	/uploads/teacher-files/1767151396003_5h3we1f4a7c.pdf	pdf	165091	application/pdf	1	2025-12-31 08:53:16.017387
2	2	1767157655842_5q45fd5jy1v.pdf	1767151413828_unct075e1ak.pdf	/uploads/teacher-files/1767157655842_5q45fd5jy1v.pdf	pdf	165091	application/pdf	1	2025-12-31 10:37:35.845759
4	3	1767337232354_fcuso0xj8gg.pdf	phase 1 level 1 123 lesson 1-Teacher Document.pdf	/uploads/teacher-files/1767337232354_fcuso0xj8gg.pdf	pdf	1981848	application/pdf	1	2026-01-02 12:30:32.414034
\.


--
-- Name: admins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admins_id_seq', 2, true);


--
-- Name: courses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.courses_id_seq', 4, true);


--
-- Name: homework_files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.homework_files_id_seq', 4, true);


--
-- Name: lessons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lessons_id_seq', 3, true);


--
-- Name: modules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.modules_id_seq', 4, true);


--
-- Name: student_files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.student_files_id_seq', 4, true);


--
-- Name: teacher_files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.teacher_files_id_seq', 4, true);


--
-- Name: admins admins_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_email_key UNIQUE (email);


--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: homework_files homework_files_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.homework_files
    ADD CONSTRAINT homework_files_pkey PRIMARY KEY (id);


--
-- Name: lessons lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_pkey PRIMARY KEY (id);


--
-- Name: modules modules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_pkey PRIMARY KEY (id);


--
-- Name: student_files student_files_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_files
    ADD CONSTRAINT student_files_pkey PRIMARY KEY (id);


--
-- Name: teacher_files teacher_files_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_files
    ADD CONSTRAINT teacher_files_pkey PRIMARY KEY (id);


--
-- Name: idx_courses_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_courses_status ON public.courses USING btree (status);


--
-- Name: idx_homework_files_lesson_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_homework_files_lesson_id ON public.homework_files USING btree (lesson_id);


--
-- Name: idx_lessons_module_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lessons_module_id ON public.lessons USING btree (module_id);


--
-- Name: idx_lessons_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lessons_status ON public.lessons USING btree (status);


--
-- Name: idx_modules_course_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_modules_course_id ON public.modules USING btree (course_id);


--
-- Name: idx_modules_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_modules_status ON public.modules USING btree (status);


--
-- Name: idx_student_files_lesson_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_student_files_lesson_id ON public.student_files USING btree (lesson_id);


--
-- Name: idx_teacher_files_lesson_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_teacher_files_lesson_id ON public.teacher_files USING btree (lesson_id);


--
-- Name: courses courses_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.admins(id) ON DELETE SET NULL;


--
-- Name: homework_files fk_homework_file_lesson; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.homework_files
    ADD CONSTRAINT fk_homework_file_lesson FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;


--
-- Name: lessons fk_lesson_module; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT fk_lesson_module FOREIGN KEY (module_id) REFERENCES public.modules(id) ON DELETE CASCADE;


--
-- Name: modules fk_module_course; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT fk_module_course FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: student_files fk_student_file_lesson; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_files
    ADD CONSTRAINT fk_student_file_lesson FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;


--
-- Name: teacher_files fk_teacher_file_lesson; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_files
    ADD CONSTRAINT fk_teacher_file_lesson FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;


--
-- Name: homework_files homework_files_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.homework_files
    ADD CONSTRAINT homework_files_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;


--
-- Name: homework_files homework_files_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.homework_files
    ADD CONSTRAINT homework_files_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.admins(id) ON DELETE SET NULL;


--
-- Name: lessons lessons_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.admins(id) ON DELETE SET NULL;


--
-- Name: lessons lessons_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id) ON DELETE CASCADE;


--
-- Name: modules modules_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: modules modules_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.admins(id) ON DELETE SET NULL;


--
-- Name: student_files student_files_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_files
    ADD CONSTRAINT student_files_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;


--
-- Name: teacher_files teacher_files_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_files
    ADD CONSTRAINT teacher_files_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;


--
-- Name: teacher_files teacher_files_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_files
    ADD CONSTRAINT teacher_files_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.admins(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict ioFJEJP8hTshGwTBu48dtFQcO83klN3LSoCWgvAmSWv8mWkYzZjTgj04RBJC9G3

