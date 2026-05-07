// import { Injectable } from '@angular/core';
// import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';
// import { addNewClass } from '../home.component';

// @Injectable({
//   providedIn: 'root'
// })
// export class ClassService {

//   async uploadClassesFromText(classesText: string, db: any): Promise<void> {
//     const lines = classesText.split('\n').filter(line => line.trim());
    
//     for (const line of lines) {
//       const className = line.trim();
//       if (className) {
//         try {
//           // Check if class already exists
//           const q = query(collection(db, 'classes'), where('name', '==', className));
//           const snapshot = await getDocs(q);
          
//           if (snapshot.empty) {
//             await addDoc(collection(db, 'classes'), { name: className });
//             addNewClass(className);
//         }
//         } catch (error) {
//           console.error('Error adding class:', className, error);
//         }
//       }
//     }
//   }
// }
