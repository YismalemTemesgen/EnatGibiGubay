import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/departments")({
  component: () => <Outlet />,
});

export const DEPARTMENTS = [
  { slug: "office", name: "ጽሕፈት ቤት" },
  { slug: "members-care", name: "የአባላት እንክብካቤ ክፍል" },
  { slug: "audit-inspection", name: "ኦዲትና ኢንስፔክሽን ክፍል" },
  { slug: "planning", name: "ዕቅድና ክትትል ክፍል" },
  { slug: "finance-property", name: "ሒሳብና ንብረት ክፍል" },
  { slug: "development", name: "ልማት ክፍል" },
  { slug: "budget-program", name: "ባጀትና መርሃ ግብር ማስተካከያ ክፍል" },
  { slug: "education-service", name: "ትምህርትና ሐዋርያዊ አገልግሎት ክፍል" },
  { slug: "media-charity", name: "ሚዲያና በጎ አድራጎት ክፍል" },
  { slug: "language-special-needs", name: "ቋንቋና ልዩ ፍላጎት ክፍል" },
  { slug: "mezmur-arts", name: "መዝሙርና ኪነ-ጥበብ ክፍል" },
] as const;

export type DepartmentSlug = (typeof DEPARTMENTS)[number]["slug"];

// re-export Link for children
export { Link };