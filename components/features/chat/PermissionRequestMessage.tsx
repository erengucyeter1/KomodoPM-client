import React, { useState } from 'react';
import axiosInstance from '@/utils/axios';

interface PermissionRequestMessageProps {
  messageId: number;
  data: {
    attemptId: number;
    projectNumber: string;
    expenseNumber: string;
    oldAmount: number;
    newAmount: number;
    status: 'pending' | 'approved' | 'rejected';
    measurementUnit?: string;
    productDescription?: string;
  };
  isOwnMessage: boolean;

}

  



export default function PermissionRequestMessage({ 
  messageId,  
  data, 
  isOwnMessage, 

}: PermissionRequestMessageProps) {
  if (!data) {
    return <p>Hatalı değişiklik talebi</p>;
  }


  const onApprove = async (attemptId: number,expenseNumber: string, newAmount: number) => {

    const isQuantityUpdated = await updateProjectExpenseQuantity(expenseNumber, newAmount)
    if(isQuantityUpdated){
      updateExpenseUpdateAttemptStatus(attemptId, 'approved')
  
    }else{
      updateExpenseUpdateAttemptStatus(attemptId, 'pending')
    }
  }
  const onReject = (attemptId: number) => {
    updateExpenseUpdateAttemptStatus(attemptId, 'rejected')
  }
  
  const updateExpenseUpdateAttemptStatus = async (attemptId: number, status: string) => {
  
    const response =  await axiosInstance.put(`/permission-requests`, {
      id: attemptId,
      status: status
    })
  
    console.log("response:", response)

    if(response.status === 200 && (response.data.success === true || response.data.success === "true")){
      console.log("Değişiklik talebi başarıyla güncellendi")
      setMessageStatus(response.data.data.status);
    }
    else{
      console.log("Değişiklik talebi güncellenirken bir hata oluştu")
    }


    // update message status
    const updateMessageStatus = await axiosInstance.patch('/messages', {
      id: messageId,
      status: status
    })

    if(updateMessageStatus.status === 200 && (updateMessageStatus.data.success === true || updateMessageStatus.data.success === "true")){
      console.log("mesaj durumu başarıyla güncellendi")
    }
    else{
      console.log("mesaj durumu güncellenirken bir hata oluştu")
    }



  }

  const updateProjectExpenseQuantity = async (expenseNumber: string, newAmount: number) => {
    const response = await axiosInstance.put(`/project-expense/${expenseNumber}`, {
      product_count: newAmount.toString()
    });

    
    if(response.status === 200 && response.data.success === true){
      return true;
    }
    return false;
  }

  

  const { attemptId, projectNumber, expenseNumber, oldAmount, newAmount, status, measurementUnit, productDescription } = data;

  const [messageStatus, setMessageStatus] = useState(data.status)

  
  return (
    <div className={`max-w-[80%] my-1 ${isOwnMessage ? 'self-end ml-auto' : 'self-start'}`}>
      <div className="border-2 border-gray-200 rounded-md p-3 bg-white text-gray-800">
        <div className="font-bold mb-2">Değişiklik Talebi</div>

        <div className="mb-3 flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <div className="text-xs text-gray-500">Proje No</div>
              <div>{projectNumber}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Gider No</div>
              <div>{expenseNumber}</div>
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full max-w-xs break-words">
            <div className="text-xs text-gray-500">Ürün</div>
            <div className="text-sm text-gray-800 break-words">{productDescription}</div>
          </div>



          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <div className="text-xs text-gray-500">Eski Miktar</div>
              <div className="line-through">{oldAmount} {measurementUnit}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Yeni Miktar</div>
              <div className="font-semibold">{newAmount} {measurementUnit}</div>
            </div>
          </div>

        </div>

        
        <div className="flex justify-between items-center">
          <div className={`px-2 py-1 rounded text-sm ${
            messageStatus === 'approved' ? 'bg-green-100 text-green-800' : 
            messageStatus === 'rejected' ? 'bg-red-100 text-red-800' : 
            'bg-yellow-100 text-yellow-800'
          }`}>
            {messageStatus === 'approved' ? 'Onaylandı' : 
             messageStatus === 'rejected' ? 'Reddedildi' : 'Beklemede'}
          </div>
          
          {!isOwnMessage && messageStatus === 'pending' && (
            <div className="flex space-x-2">
              <button 
                onClick={() => onReject(attemptId)}
                className="px-3 py-1 bg-red-500 text-white rounded-md text-sm"
              >
                Reddet
              </button>
              <button 
                onClick={() => onApprove(attemptId,expenseNumber, newAmount)}
                className="px-3 py-1 bg-green-500 text-white rounded-md text-sm"
              >
                Onayla
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="text-xs mt-1 ml-2 text-gray-500">
        {/* Timestamp can be added here if needed */}
      </div>
    </div>
  );
}