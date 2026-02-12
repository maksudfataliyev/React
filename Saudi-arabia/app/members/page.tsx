"use client";

import Hero from "@/components/ui/hero";
import Image from "next/image";
import { useEffect, useState } from "react";

interface Member {
    id: number;
    login: string;
    avatar_url: string;
    html_url: string;
}

export default function Members() {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const response = await fetch("https://api.github.com/users");
                const data = await response.json();
                setMembers(data);
            } catch (error) {
                console.error("Error fetching members:", error);
           }finally{
            setLoading(false);
           }
        };

        fetchMembers();
    }, []);

    return (
        <div>
            <Hero
                image="/about-us.jpg"
                title="Our Team"
                description="Meet the contributors making an impact."
            />

            <div className="container mx-auto p-8">
                {loading ? (
                    <p className="text-center">Loading members...</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {members.map((member) => (
                            <div key={member.id} className="flex flex-col items-center p-4 border rounded-lg shadow-sm">
                                <Image
                                    src={member.avatar_url}
                                    alt={member.login}
                                    width={100}
                                    height={100}
                                    className="rounded-full mb-4"
                                />
                                <h3 className="font-bold text-lg">@{member.login}</h3>
                                <a 
                                    href={member.html_url} 
                                    target="_blank" 
                                    className="text-blue-500 hover:underline text-sm"
                                >
                                    View Profile
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}