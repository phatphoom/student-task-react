// "use client";
// import { useEffect, useState } from "react";

// export default function TaskList() {
//   const [tasks, setTasks] = useState([]);

//   useEffect(() => {
//     fetch("http://localhost:8080/api/tasks")
//       .then((res) => res.json())
//       .then((data) => setTasks(data));
//   }, []);

//   return (
//     <div className="p-4">
//       <table className="border w-full">
//         <thead>
//           <tr className="bg-gray-100">
//             <th>Due Date</th>
//             <th>Subject</th>
//             <th>Teacher</th>
//             <th>What to Finish</th>
//             <th>Type</th>
//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {tasks.map((t, i) => (
//             <tr key={i}>
//               <td>{t.due_date}</td>
//               <td>{t.subject}</td>
//               <td>{t.teacher}</td>
//               <td>{t.wtf}</td>
//               <td>{t.work_type}</td>
//               <td>
//                 <button className="text-blue-500">Edit</button> |{" "}
//                 <button
//                   className="text-red-500"
//                   onClick={async () => {
//                     await fetch(`http://localhost:8080/api/tasks/${t.taskid}`, {
//                       method: "DELETE",
//                     });
//                     window.location.reload();
//                   }}
//                 >
//                   Delete
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }
