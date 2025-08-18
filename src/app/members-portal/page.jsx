// "use client";

// import { useSession, signOut, signIn } from "next-auth/react";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import {
//   Loader2,
//   User,
//   LogOut,
//   Home,
//   BookOpen,
//   Users,
//   Settings,
// } from "lucide-react";
// import Link from "next/link";
// import { useState, useEffect } from "react";

// export default function MembersPage() {
//   const { data: session, status } = useSession();
//   const [quizResponses, setQuizResponses] = useState([]);

//   useEffect(() => {
//     async function fetchQuizResponses() {
//       if (session) {
//         try {
//           const res = await fetch("/api/course-platform/responses");
//           if (res.ok) {
//             const data = await res.json();
//             setQuizResponses(data);
//           }
//         } catch (error) {
//           console.error("Error fetching quiz responses:", error);
//         }
//       }
//     }
//     fetchQuizResponses();
//   }, [session]);

//   if (status === "loading") {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
//         <div className="flex flex-col items-center gap-4">
//           <Loader2 className="h-10 w-10 animate-spin text-red-600" />
//           <p className="text-lg text-muted-foreground">
//             Loading user session...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   if (status === "unauthenticated") {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
//         <Card className="w-full max-w-md text-center shadow-lg">
//           <CardHeader>
//             <CardTitle className="text-3xl font-bold text-red-600">
//               Access Denied
//             </CardTitle>
//             <CardDescription className="mt-2 text-muted-foreground">
//               You need to be logged in to view this page.
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <Button onClick={() => signIn()} className="w-full py-2 text-lg">
//               Login
//             </Button>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
//       {/* Sidebar */}
//       <aside className="w-64 bg-white shadow-lg h-screen fixed">
//         <div className="p-4 border-b border-gray-200">
//           <div className="flex items-center gap-2 mb-4">
//             <User className="h-8 w-8 text-red-600" />
//             <h2 className="text-xl font-semibold text-gray-900">
//               {session.user.name}
//             </h2>
//           </div>
//           <Badge
//             variant="secondary"
//             className="px-4 py-2 text-sm w-full text-center"
//           >
//             {session.user.role}
//           </Badge>
//         </div>
//         <nav className="mt-6">
//           <ul className="space-y-2">
//             <li>
//               <Link
//                 href="/members"
//                 className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-red-100 hover:text-red-700 rounded"
//               >
//                 <Home className="h-5 w-5" />
//                 Dashboard
//               </Link>
//             </li>
//             <li>
//               <Link
//                 href="/course-platform/courses"
//                 className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-red-100 hover:text-red-700 rounded"
//               >
//                 <BookOpen className="h-5 w-5" />
//                 CEU Library
//               </Link>
//             </li>
//             {session.user.role === "admin" && (
//               <li>
//                 <Link
//                   href="/course-platform/admin"
//                   className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-red-100 hover:text-red-700 rounded"
//                 >
//                   <Users className="h-5 w-5" />
//                   Admin Panel
//                 </Link>
//               </li>
//             )}
//             <li>
//               <Link
//                 href="/members/settings"
//                 className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-red-100 hover:text-red-700 rounded"
//               >
//                 <Settings className="h-5 w-5" />
//                 Settings
//               </Link>
//             </li>
//             <li>
//               <Button
//                 onClick={() => signOut({ callbackUrl: "/" })}
//                 className="w-full mt-4 gap-2 py-2 text-gray-700 hover:bg-red-600 hover:text-white rounded"
//                 variant="ghost"
//               >
//                 <LogOut className="h-5 w-5" />
//                 Logout
//               </Button>
//             </li>
//           </ul>
//         </nav>
//       </aside>

//       {/* Main Content */}
//       <main className="ml-64 flex-1 p-8">
//         <h1 className="text-3xl font-bold text-gray-900 mb-6">
//           Members Portal
//         </h1>
//         <Card className="w-full shadow-lg">
//           <CardHeader>
//             <CardTitle className="text-2xl font-bold text-red-600">
//               Welcome
//             </CardTitle>
//             <CardDescription className="text-muted-foreground">
//               Explore the CEU Library and your earned certificates.
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <h3 className="text-xl font-semibold mb-4">Your Certificates</h3>
//             {quizResponses.length === 0 ? (
//               <p className="text-gray-700">
//                 You haven't earned any certificates yet. Visit the{" "}
//                 <Link
//                   href="/course-platform/courses"
//                   className="text-blue-600 underline"
//                 >
//                   CEU Library
//                 </Link>{" "}
//                 to start a course!
//               </p>
//             ) : (
//               <div className="space-y-4">
//                 {quizResponses.map((response, index) => (
//                   <div
//                     key={index}
//                     className="p-4 border rounded-lg shadow-sm flex justify-between items-center"
//                   >
//                     <div>
//                       <p className="font-medium">{response.courseTitle}</p>
//                       <p className="text-sm text-gray-600">
//                         Score: {response.score}/{response.total} (
//                         {response.passed ? "Passed" : "Not Passed"})
//                       </p>
//                     </div>
//                     {response.certificateUrl && (
//                       <a
//                         href={response.certificateUrl}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="text-blue-600 underline"
//                       >
//                         View Certificate
//                       </a>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </main>
//     </div>
//   );
// }
"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function MembersPage({ children }) {
  const { data: session, status } = useSession();
  const [quizResponses, setQuizResponses] = useState([]);

  useEffect(() => {
    async function fetchQuizResponses() {
      if (session) {
        try {
          const res = await fetch("/api/course-platform/members-quiz-response");
          if (res.ok) {
            const data = await res.json();
            setQuizResponses(data);
          } else {
            console.error("Failed to fetch quiz responses:", res.status);
          }
        } catch (error) {
          console.error("Error fetching quiz responses:", error);
        }
      }
    }
    fetchQuizResponses();
  }, [session]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-red-600" />
          <p className="text-lg text-muted-foreground">
            Loading user session...
          </p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-red-600">
              Access Denied
            </CardTitle>
            <CardDescription className="mt-2 text-muted-foreground">
              You need to be logged in to view this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => signIn("credentials", { callbackUrl: "/members" })}
              className="w-full py-2 text-lg"
            >
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Members Portal
        </h1>
        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-red-600">
              Welcome, {session.user.name}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Explore the CEU Library and your earned certificates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <h3 className="text-xl font-semibold mb-4">Your Certificates</h3>
            {quizResponses.length === 0 ? (
              <p className="text-gray-700">
                You haven't earned any certificates yet. Visit the{" "}
                <Link
                  href="/members-portal/course-platform/courses"
                  className="text-blue-600 underline"
                >
                  CEU Library
                </Link>{" "}
                to start a course!
              </p>
            ) : (
              <div className="space-y-4">
                {quizResponses.map((response, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg shadow-sm flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{response.courseTitle}</p>
                      <p className="text-sm text-gray-600">
                        Score: {response.score}/{response.total} (
                        {response.passed ? "Passed" : "Not Passed"})
                      </p>
                    </div>
                    {response.certificateUrl && (
                      <a
                        href={response.certificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        View Certificate
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}