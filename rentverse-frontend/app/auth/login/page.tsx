import ModalLogIn from '@/components/ModalLogIn'
import React from 'react'

export default function LoginPage() {
    return (
        <div className='min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden'>
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-100/40 rounded-full blur-3xl"></div>
                <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] bg-teal-100/40 rounded-full blur-3xl"></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                <AuthGuard requireAuth={false} redirectTo="/">
                    <ModalLogIn isModal={false} />
                </AuthGuard>
            </div>
        </div>
    )
}
