// 'use client';

// import { AdminLayout } from '../../components/admin/AdminLayout';
// import { useAppSelector, useAppDispatch } from '../../redux/hooks';
// import { Card } from '../../components/ui/card';
// import { Button } from '../../components/ui/button';
// import { Loader2, Plus, Trash2, Edit2 } from 'lucide-react';
// import { fetchPickupPoints, deletePickupPoint } from '../../redux/pickupPoints/pickupPointsSlice';
// import { PickupPointForm } from '../../components/admin/PickupPointForm';
// import React, { useEffect, useState } from 'react';
// import { toast } from 'sonner';
// import { PickupPoint } from '../../types/pickup-point';

// export function AdminClient() {
//   const dispatch = useAppDispatch();
//   const pickupPoints = useAppSelector((state) => state.pickupPoints.pickupPoints);
//   const loading = useAppSelector((state) => state.pickupPoints.loading);
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [selectedPickupPoint, setSelectedPickupPoint] = useState<PickupPoint | null>(null);

//   useEffect(() => {
//     dispatch(fetchPickupPoints());
//   }, [dispatch]);

//   const handleDelete = async (id: string) => {
//     if (window.confirm('Are you sure you want to delete this pickup point?')) {
//       try {
//         await dispatch(deletePickupPoint(id)).unwrap();
//         toast.success('Pickup point deleted successfully');
//       } catch (error) {
//         toast.error('Failed to delete pickup point');
//       }
//     }
//   };

//   return (
//     <AdminLayout>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {loading ? (
//           <div className="col-span-full flex justify-center">
//             <Loader2 className="h-8 w-8 animate-spin" />
//           </div>
//         ) : (
//           pickupPoints.map((point: any) => (
//             <Card key={point._id} className="p-4">
//               <div className="flex justify-between items-start">
//                 <div>
//                   <h3 className="font-semibold">{point.name}</h3>
//                   <p className="text-sm text-gray-600">{point.address}</p>
//                   <p className="text-sm text-gray-600">
//                     {point.city}, {point.postalCode}
//                   </p>
//                 </div>
//                 <div className="flex gap-2">
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     onClick={() => setSelectedPickupPoint(point)}
//                   >
//                     <Edit2 className="h-4 w-4" />
//                   </Button>
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     onClick={() => handleDelete(point._id)}
//                   >
//                     <Trash2 className="h-4 w-4 text-red-500" />
//                   </Button>
//                 </div>
//               </div>
//             </Card>
//           ))
//         )}
//       </div>

//       {showAddForm && (
//         <PickupPointForm
//           onSuccess={() => {
//             setShowAddForm(false);
//             dispatch(fetchPickupPoints() as any);
//           }}
//           onCancel={() => setShowAddForm(false)}
//         />
//       )}

//       {selectedPickupPoint && (
//         <PickupPointForm
//           initialData={selectedPickupPoint}
//           onSuccess={() => {
//             setSelectedPickupPoint(null);
//             dispatch(fetchPickupPoints() as any);
//           }}
//           onCancel={() => setSelectedPickupPoint(null)}
//         />
//       )}
//     </AdminLayout>
//   );
// }
