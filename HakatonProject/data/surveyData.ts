import { SurveyResponse } from '../types';

const rawData = `ID	age	city	education_level	sorts_waste	knows_recycling_points	participated_in_cleanups	main_barrier	cares_about_ecology	uses_plastic
1	16	Baku	School	0	0	0	I don't know where	4	Always
2	17	Ganja	School	1	1	1	There is no time	5	Sometimes
3	19	Lankaran	Secondary	1	1	0	Not interesting	3	Always
4	21	Shaki	Higher	1	1	1	Not answered	5	Never
5	25	Sumqayit	Higher	0	0	0	I don't believe in the effect	2	Always
6	30	Baku	Higher	1	1	1	Not answered	4	Sometimes
7	15	Quba	School	0	0	0	I don't know where	3	Always
8	42	Shirvan	Secondary	1	0	0	There is no time	4	Sometimes
9	18	Mingachevir	School	0	1	0	Not interesting	2	Always
10	23	Baku	Higher	1	1	1	Not answered	5	Never
11	55	Nakhchivan	Secondary	0	1	1	Not answered	3	Sometimes
12	16	Ganja	School	0	0	0	I don't know where	4	Always
13	19	Baku	Secondary	1	1	1	Not answered	5	Sometimes
14	20	Lankaran	Higher	0	0	0	I don't believe in the effect	1	Always
15	35	Quba	Higher	1	1	1	Not answered	4	Never
16	17	Shaki	School	1	1	0	There is no time	4	Sometimes
17	28	Sumqayit	Higher	0	1	0	Not interesting	3	Always
18	45	Baku	Higher	1	1	1	Not answered	5	Sometimes
19	14	Ganja	School	0	0	0	I don't know where	2	Always
20	22	Shirvan	Higher	1	1	1	Not answered	5	Never
21	16	Baku	School	0	1	0	Not interesting	3	Sometimes
22	18	Ganja	School	1	1	1	There is no time	5	Never
23	20	Lankaran	Higher	1	0	0	I don't know where	4	Sometimes
24	24	Shaki	Higher	1	1	1	Not answered	5	Never
25	26	Sumqayit	Higher	0	0	0	I don't believe in the effect	2	Always
26	32	Baku	Higher	1	1	1	Not answered	4	Sometimes
27	15	Quba	School	0	0	0	I don't know where	3	Always
28	40	Shirvan	Secondary	1	1	0	There is no time	4	Sometimes
29	17	Mingachevir	School	0	1	0	Not interesting	2	Always
30	25	Baku	Higher	1	1	1	Not answered	5	Never
31	50	Nakhchivan	Secondary	0	1	1	Not answered	3	Sometimes
32	16	Ganja	School	0	0	0	I don't know where	4	Always
33	19	Baku	Secondary	1	1	1	Not answered	5	Sometimes
34	21	Lankaran	Higher	0	0	0	I don't believe in the effect	1	Always
35	33	Quba	Higher	1	1	1	Not answered	4	Never
36	18	Shaki	School	1	1	0	There is no time	4	Sometimes
37	27	Sumqayit	Higher	0	1	0	Not interesting	3	Always
38	44	Baku	Higher	1	1	1	Not answered	5	Sometimes
39	15	Ganja	School	0	0	0	I don't know where	2	Always
40	24	Shirvan	Higher	1	1	1	Not answered	5	Never
41	17	Baku	School	0	1	0	Not interesting	3	Sometimes
42	19	Ganja	School	1	1	1	There is no time	5	Never
43	22	Lankaran	Higher	1	0	0	I don't know where	4	Sometimes
44	23	Shaki	Higher	1	1	1	Not answered	5	Never
45	27	Sumqayit	Higher	0	0	0	I don't believe in the effect	2	Always
46	31	Baku	Higher	1	1	1	Not answered	4	Sometimes
47	16	Quba	School	0	0	0	I don't know where	3	Always
48	39	Shirvan	Secondary	1	1	0	There is no time	4	Sometimes
49	18	Mingachevir	School	0	1	0	Not interesting	2	Always
50	26	Baku	Higher	1	1	1	Not answered	5	Never
51	52	Nakhchivan	Secondary	0	1	1	Not answered	3	Sometimes
52	17	Ganja	School	0	0	0	I don't know where	4	Always
53	20	Baku	Secondary	1	1	1	Not answered	5	Sometimes
54	21	Lankaran	Higher	0	0	0	I don't believe in the effect	1	Always
55	34	Quba	Higher	1	1	1	Not answered	4	Never
56	18	Shaki	School	1	1	0	There is no time	4	Sometimes
57	29	Sumqayit	Higher	0	1	0	Not interesting	3	Always
58	43	Baku	Higher	1	1	1	Not answered	5	Sometimes
59	15	Ganja	School	0	0	0	I don't know where	2	Always
60	23	Shirvan	Higher	1	1	1	Not answered	5	Never
61	16	Baku	School	0	1	0	Not interesting	3	Sometimes
62	18	Ganja	School	1	1	1	There is no time	5	Never
63	20	Lankaran	Higher	1	0	0	I don't know where	4	Sometimes
64	25	Shaki	Higher	1	1	1	Not answered	5	Never
65	28	Sumqayit	Higher	0	0	0	I don't believe in the effect	2	Always
66	33	Baku	Higher	1	1	1	Not answered	4	Sometimes
67	17	Quba	School	0	0	0	I don't know where	3	Always
68	41	Shirvan	Secondary	1	1	0	There is no time	4	Sometimes
69	19	Mingachevir	School	0	1	0	Not interesting	2	Always
70	24	Baku	Higher	1	1	1	Not answered	5	Never
71	54	Nakhchivan	Secondary	0	1	1	Not answered	3	Sometimes
72	16	Ganja	School	0	0	0	I don't know where	4	Always
73	19	Baku	Secondary	1	1	1	Not answered	5	Sometimes
74	22	Lankaran	Higher	0	0	0	I don't believe in the effect	1	Always
75	36	Quba	Higher	1	1	1	Not answered	4	Never
76	17	Shaki	School	1	1	0	There is no time	4	Sometimes
77	30	Sumqayit	Higher	0	1	0	Not interesting	3	Always
78	46	Baku	Higher	1	1	1	Not answered	5	Sometimes
79	15	Ganja	School	0	0	0	I don't know where	2	Always
80	25	Shirvan	Higher	1	1	1	Not answered	5	Never
81	18	Baku	School	0	1	0	Not interesting	3	Sometimes
82	20	Ganja	School	1	1	1	There is no time	5	Never
83	23	Lankaran	Higher	1	0	0	I don't know where	4	Sometimes
84	26	Shaki	Higher	1	1	1	Not answered	5	Never
85	29	Sumqayit	Higher	0	0	0	I don't believe in the effect	2	Always
86	34	Baku	Higher	1	1	1	Not answered	4	Sometimes
87	16	Quba	School	0	0	0	I don't know where	3	Always
88	38	Shirvan	Secondary	1	1	0	There is no time	4	Sometimes
89	17	Mingachevir	School	0	1	0	Not interesting	2	Always
90	27	Baku	Higher	1	1	1	Not answered	5	Never
91	51	Nakhchivan	Secondary	0	1	1	Not answered	3	Sometimes
92	17	Ganja	School	0	0	0	I don't know where	4	Always
93	21	Baku	Secondary	1	1	1	Not answered	5	Sometimes
94	24	Lankaran	Higher	0	0	0	I don't believe in the effect	1	Always
95	37	Quba	Higher	1	1	1	Not answered	4	Never
96	18	Shaki	School	1	1	0	There is no time	4	Sometimes
97	31	Sumqayit	Higher	0	1	0	Not interesting	3	Always
98	47	Baku	Higher	1	1	1	Not answered	5	Sometimes
99	15	Ganja	School	0	0	0	I don't know where	2	Always
100	26	Shirvan	Higher	1	1	1	Not answered	5	Never
101	16	Baku	School	0	1	0	Not interesting	3	Sometimes
102	19	Ganja	School	1	1	1	There is no time	5	Never
103	22	Lankaran	Higher	1	0	0	I don't know where	4	Sometimes
104	25	Shaki	Higher	1	1	1	Not answered	5	Never
105	30	Sumqayit	Higher	0	0	0	I don't believe in the effect	2	Always
106	35	Baku	Higher	1	1	1	Not answered	4	Sometimes
107	17	Quba	School	0	0	0	I don't know where	3	Always
108	40	Shirvan	Secondary	1	1	0	There is no time	4	Sometimes
109	18	Mingachevir	School	0	1	0	Not interesting	2	Always
110	28	Baku	Higher	1	1	1	Not answered	5	Never
111	53	Nakhchivan	Secondary	0	1	1	Not answered	3	Sometimes
112	16	Ganja	School	0	0	0	I don't know where	4	Always
113	20	Baku	Secondary	1	1	1	Not answered	5	Sometimes
114	23	Lankaran	Higher	0	0	0	I don't believe in the effect	1	Always
115	38	Quba	Higher	1	1	1	Not answered	4	Never
116	17	Shaki	School	1	1	0	There is no time	4	Sometimes
117	32	Sumqayit	Higher	0	1	0	Not interesting	3	Always
118	48	Baku	Higher	1	1	1	Not answered	5	Sometimes
119	15	Ganja	School	0	0	0	I don't know where	2	Always
120	27	Shirvan	Higher	1	1	1	Not answered	5	Never
121	18	Baku	School	0	1	0	Not interesting	3	Sometimes
122	21	Ganja	School	1	1	1	There is no time	5	Never
123	24	Lankaran	Higher	1	0	0	I don't know where	4	Sometimes
124	27	Shaki	Higher	1	1	1	Not answered	5	Never
125	31	Sumqayit	Higher	0	0	0	I don't believe in the effect	2	Always
126	36	Baku	Higher	1	1	1	Not answered	4	Sometimes
127	16	Quba	School	0	0	0	I don't know where	3	Always
128	39	Shirvan	Secondary	1	1	0	There is no time	4	Sometimes
129	19	Mingachevir	School	0	1	0	Not interesting	2	Always
130	29	Baku	Higher	1	1	1	Not answered	5	Never
131	56	Nakhchivan	Secondary	0	1	1	Not answered	3	Sometimes
132	17	Ganja	School	0	0	0	I don't know where	4	Always
133	22	Baku	Secondary	1	1	1	Not answered	5	Sometimes
134	25	Lankaran	Higher	0	0	0	I don't believe in the effect	1	Always
135	39	Quba	Higher	1	1	1	Not answered	4	Never
136	18	Shaki	School	1	1	0	There is no time	4	Sometimes
137	33	Sumqayit	Higher	0	1	0	Not interesting	3	Always
138	49	Baku	Higher	1	1	1	Not answered	5	Sometimes
139	15	Ganja	School	0	0	0	I don't know where	2	Always
140	28	Shirvan	Higher	1	1	1	Not answered	5	Never
141	17	Baku	School	0	1	0	Not interesting	3	Sometimes
142	20	Ganja	School	1	1	1	There is no time	5	Never
143	26	Lankaran	Higher	1	0	0	I don't know where	4	Sometimes
144	29	Shaki	Higher	1	1	1	Not answered	5	Never
145	32	Sumqayit	Higher	0	0	0	I don't believe in the effect	2	Always
146	37	Baku	Higher	1	1	1	Not answered	4	Sometimes
147	16	Quba	School	0	0	0	I don't know where	3	Always
148	41	Shirvan	Secondary	1	1	0	There is no time	4	Sometimes
149	18	Mingachevir	School	0	1	0	Not interesting	2	Always
150	30	Baku	Higher	1	1	1	Not answered	5	Never
151	57	Nakhchivan	Secondary	0	1	1	Not answered	3	Sometimes
152	16	Ganja	School	0	0	0	I don't know where	4	Always
153	21	Baku	Secondary	1	1	1	Not answered	5	Sometimes
154	24	Lankaran	Higher	0	0	0	I don't believe in the effect	1	Always
155	40	Quba	Higher	1	1	1	Not answered	4	Never
156	17	Shaki	School	1	1	0	There is no time	4	Sometimes
157	34	Sumqayit	Higher	0	1	0	Not interesting	3	Always
158	50	Baku	Higher	1	1	1	Not answered	5	Sometimes
159	15	Ganja	School	0	0	0	I don't know where	2	Always
160	29	Shirvan	Higher	1	1	1	Not answered	5	Never
161	18	Baku	School	0	1	0	Not interesting	3	Sometimes
162	22	Ganja	School	1	1	1	There is no time	5	Never
163	27	Lankaran	Higher	1	0	0	I don't know where	4	Sometimes
164	30	Shaki	Higher	1	1	1	Not answered	5	Never
165	33	Sumqayit	Higher	0	0	0	I don't believe in the effect	2	Always
166	38	Baku	Higher	1	1	1	Not answered	4	Sometimes
167	17	Quba	School	0	0	0	I don't know where	3	Always
168	42	Shirvan	Secondary	1	1	0	There is no time	4	Sometimes
169	19	Mingachevir	School	0	1	0	Not interesting	2	Always
170	31	Baku	Higher	1	1	1	Not answered	5	Never
171	58	Nakhchivan	Secondary	0	1	1	Not answered	3	Sometimes
172	16	Ganja	School	0	0	0	I don't know where	4	Always
173	23	Baku	Secondary	1	1	1	Not answered	5	Sometimes
174	28	Lankaran	Higher	0	0	0	I don't believe in the effect	1	Always
175	41	Quba	Higher	1	1	1	Not answered	4	Never
176	18	Shaki	School	1	1	0	There is no time	4	Sometimes
177	35	Sumqayit	Higher	0	1	0	Not interesting	3	Always
178	51	Baku	Higher	1	1	1	Not answered	5	Sometimes
179	15	Ganja	School	0	0	0	I don't know where	2	Always
180	30	Shirvan	Higher	1	1	1	Not answered	5	Never
181	17	Baku	School	0	1	0	Not interesting	3	Sometimes
182	24	Ganja	School	1	1	1	There is no time	5	Never
183	29	Lankaran	Higher	1	0	0	I don't know where	4	Sometimes
184	31	Shaki	Higher	1	1	1	Not answered	5	Never
185	34	Sumqayit	Higher	0	0	0	I don't believe in the effect	2	Always
186	39	Baku	Higher	1	1	1	Not answered	4	Sometimes
187	16	Quba	School	0	0	0	I don't know where	3	Always
188	43	Shirvan	Secondary	1	1	0	There is no time	4	Sometimes
189	18	Mingachevir	School	0	1	0	Not interesting	2	Always
190	32	Baku	Higher	1	1	1	Not answered	5	Never
191	59	Nakhchivan	Secondary	0	1	1	Not answered	3	Sometimes
192	16	Ganja	School	0	0	0	I don't know where	4	Always
193	25	Baku	Secondary	1	1	1	Not answered	5	Sometimes
194	30	Lankaran	Higher	0	0	0	I don't believe in the effect	1	Always
195	42	Quba	Higher	1	1	1	Not answered	4	Never
196	17	Shaki	School	1	1	0	There is no time	4	Sometimes
197	36	Sumqayit	Higher	0	1	0	Not interesting	3	Always
198	52	Baku	Higher	1	1	1	Not answered	5	Sometimes
199	15	Ganja	School	0	0	0	I don't know where	2	Always
200	31	Shirvan	Higher	1	1	1	Not answered	5	Never`;

export const surveyData: SurveyResponse[] = rawData
  .trim()
  .split('\n')
  .slice(1) // Skip header
  .map(line => {
    // Attempt to split by tab first, fallback to regex for multiple spaces if pasted incorrectly
    const parts = line.includes('\t') ? line.split('\t') : line.split(/\s{2,}/);
    
    // Ensure we have enough parts, otherwise handle gracefully
    if (parts.length < 10) return null;

    const [
      id, 
      age, 
      city, 
      education, 
      sorts, 
      knows, 
      cleanups, 
      barrier, 
      cares, 
      plastic
    ] = parts;

    return {
      id: Number(id),
      age: Number(age),
      city: city.trim(),
      educationLevel: education.trim(),
      sortsWaste: sorts.trim() === '1',
      knowsRecyclingPoints: knows.trim() === '1',
      participatedInCleanups: cleanups.trim() === '1',
      mainBarrier: barrier.trim(),
      caresAboutEcology: Number(cares),
      usesPlastic: plastic.trim()
    };
  })
  .filter((item): item is SurveyResponse => item !== null);
