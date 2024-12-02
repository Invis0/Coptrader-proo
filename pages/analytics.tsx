import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Analytics() {
    const router = useRouter();
    
    useEffect(() => {
        // Redirect to dashboard for now
        router.push('/');
    }, []);
    
    return null;
}