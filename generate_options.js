const fs = require('fs');

const eduRaw = `Engineering & Technology	B.Tech / BE, M.Tech / ME, Diploma in Engineering, Polytechnic, B.Arch, M.Arch
IT & Software	BCA, MCA, B.Sc IT, M.Sc IT, B.Sc Computer Science, M.Sc Computer Science, PGDCA, Computer Diploma
Management & Business	BBA, MBA, BBM, PGDM, BMS, M.Com, B.Com, Bachelor of Management Studies
Commerce & Finance	B.Com, M.Com, CA, CMA, CS, CFA, ACCA, Diploma in Accounting, Financial Management
Arts & Humanities	BA, MA, Bachelor of Arts, Master of Arts, BA English, BA Psychology, BA Sociology, BA History, BA Political Science
Science	B.Sc, M.Sc, B.Sc Physics, M.Sc Physics, B.Sc Chemistry, M.Sc Chemistry, B.Sc Mathematics, M.Sc Mathematics, B.Sc Biology
Medical & Healthcare	MBBS, MD, MS, BDS, MDS, BAMS, BHMS, BUMS, BNYS, BPT, MPT, BOT, MOT, B.Sc Nursing, M.Sc Nursing
Pharmacy	B.Pharm, M.Pharm, Pharm.D, D.Pharm
Law	LLB, LLM, BA LLB, BBA LLB, B.Com LLB, B.Sc LLB, Diploma in Law
Education & Teaching	B.Ed, M.Ed, D.Ed, D.El.Ed, B.El.Ed, M.Phil Education, PhD Education
Design & Fashion	B.Des, M.Des, Fashion Design, Interior Design, Graphic Design, Product Design, Textile Design
Media & Communication	BJMC, MJMC, Mass Communication, Journalism, Advertising, Public Relations, Film Making
Hotel Management & Hospitality	BHM, MHM, Hotel Management, Hospitality Management, Tourism Management
Architecture & Planning	B.Arch, M.Arch, B.Plan, M.Plan
Agriculture & Forestry	B.Sc Agriculture, M.Sc Agriculture, B.Tech Agricultural Engineering, M.Sc Forestry, B.Sc Horticulture
Veterinary	BVSc, MVSc, Veterinary Diploma
Aviation & Maritime	Commercial Pilot License, Aviation Management, Aeronautical Engineering, Nautical Science, Marine Engineering
Social Work	BSW, MSW, Social Work Diploma
Library & Information Science	BLIS, MLIS, Library Science Diploma
Journalism & Publishing	BJ, MJ, Journalism Diploma, Publishing
Performing Arts	Bachelor of Music, Master of Music, Dance, Theatre, Fine Arts
Fine Arts	BFA, MFA, Applied Arts, Painting, Sculpture
Languages	BA Language, MA Language, Foreign Language Diploma, Translation
Vocational & Technical	ITI, Polytechnic, Vocational Diploma, Skill Certification, Technical Diploma
Defence & Police	Defence Studies, Military Science, Police Science, Defence Management
Psychology & Behavioural Sciences	BA Psychology, MA Psychology, B.Sc Psychology, M.Sc Psychology, Clinical Psychology
Environmental Studies	Environmental Science, Environmental Engineering, Environmental Management
Research & Doctoral	M.Phil, PhD, D.Phil, Post-Doctoral
Professional Certifications	CA, CS, CMA, CFA, ACCA, FRM, PMP, CPA
Other / Specialized	Library Science, Nutrition & Dietetics, Sports Management, Physical Education, Biotechnology, Microbiology, Biochemistry, Genetics`;

const workRaw = `IT & Software	Software Developer, Software Engineer, Web Developer, App Developer, Data Analyst, Data Scientist, AI/ML Professional, IT Professional, Cybersecurity Professional, DevOps Professional, IT Support
Engineering	Mechanical Engineer, Civil Engineer, Electrical Engineer, Electronics Engineer, Chemical Engineer, Automobile Engineer, Aerospace Engineer, Other Engineer
Management	Manager, Project Manager, Product Manager, Operations Manager, Business Manager, Management Consultant
Finance & Accounting	Accountant, Chartered Accountant, Financial Analyst, Investment Banker, Auditor, Tax Consultant, Financial Advisor, Banking Professional
Sales & Marketing	Sales Professional, Business Development, Marketing Professional, Digital Marketer, Advertising Professional, Public Relations
Human Resources	HR Manager, HR Professional, Recruiter, Talent Acquisition, Training & Development
Medical & Healthcare	Doctor, Dentist, Nurse, Pharmacist, Physiotherapist, Psychologist, Medical Professional, Healthcare Professional
Law	Lawyer, Advocate, Legal Advisor, Legal Professional, Judge
Education	Teacher, Professor, Lecturer, Principal, Tutor, Education Professional, Academic Researcher
Government & Public Sector	Civil Services, Government Officer, Government Employee, Public Sector Employee, Government Teacher
Defence & Police	Army, Navy, Air Force, Police, Paramilitary, Defence Professional
Architecture & Design	Architect, Interior Designer, Graphic Designer, UI/UX Designer, Fashion Designer, Product Designer, Other Designer
Media & Entertainment	Journalist, Content Creator, Filmmaker, Actor, Director, Producer, Photographer, Video Editor, Animator
Science & Research	Scientist, Researcher, Biologist, Chemist, Physicist, Mathematician, Other Research Professional
Pharmaceuticals	Pharmaceutical Professional, Clinical Research, Medical Representative, Drug Safety, Regulatory Affairs
Construction & Real Estate	Contractor, Construction Professional, Real Estate Professional, Property Manager, Civil Professional
Hospitality & Tourism	Hotel Professional, Chef, Restaurant Professional, Travel Consultant, Tourism Professional, Event Manager
Aviation	Pilot, Cabin Crew, Aviation Professional, Airport Professional
Agriculture & Farming	Farmer, Agricultural Professional, Farm Manager, Horticulturist, Dairy Farmer
Skilled Trades	Electrician, Plumber, Carpenter, Mechanic, Technician, Welder, Driver, Other Skilled Worker
Retail & Customer Service	Retail Professional, Store Manager, Customer Service, Customer Support, Call Center Professional
Supply Chain & Logistics	Logistics Professional, Supply Chain Professional, Procurement Professional, Warehouse Professional
Manufacturing	Manufacturing Professional, Production Manager, Factory Worker, Quality Professional, Maintenance Professional
NGO & Social Sector	Social Worker, NGO Professional, Community Worker, Development Professional
Sports & Fitness	Athlete, Sports Professional, Coach, Fitness Trainer, Yoga Instructor
Beauty & Wellness	Beautician, Makeup Artist, Hair Stylist, Wellness Professional
Business & Entrepreneurship	Business Owner, Entrepreneur, Startup Founder, Family Business, Freelancer, Self-Employed
Arts & Creative	Artist, Musician, Singer, Dancer, Choreographer, Theatre Artist, Writer
Student	Student
Retired	Retired
Not Working	Homemaker, Unemployed, Not Working
Other	Other Profession`;

function parseData(raw) {
    const lines = raw.trim().split('\n');
    let options = [];
    for (const line of lines) {
        const [category, itemsStr] = line.split('\t');
        if (!itemsStr) continue;
        const items = itemsStr.split(',').map(s => s.trim());
        for (const item of items) {
            options.push({ label: item, value: item, category: category });
        }
    }
    return options;
}

const eduOptions = parseData(eduRaw);
const workOptions = parseData(workRaw);

fs.writeFileSync('options_data.json', JSON.stringify({ education: eduOptions, workRole: workOptions }, null, 2));
