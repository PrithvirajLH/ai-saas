import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { increaseApiLimit, checkApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
const configuration = {
    apiKey: process.env.OPENAI_API_KEY,
};

const openai = new OpenAI(configuration);


export async function POST(
    req:Request
) {
    try{
        const{userId} = auth();
        const body = await req.json();
        const {messages} = body;

        if(!userId){
            return new NextResponse("Unauthorized", {status:401});
        }

        if(!configuration.apiKey){
            return new NextResponse("OpenAI API key not configured",{status:500});
        }

        if(!messages){
            return new NextResponse("Messages are required", {status:400});
        }
        const freeTrial = await checkApiLimit();
        const isPro = await checkSubscription();
        if(!freeTrial && !isPro){
            return new NextResponse("Free trial has expired.", {status:403});
        }

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {role: "system", 
                content: "You are a code generator.You must answer only in markdown code snippets also Use code comments for explananting the code generated."},...messages
            ]
        });
        if(!isPro){
            await increaseApiLimit();
        }
        
        return NextResponse.json(response.choices[0].message);
    }catch(error){
        console.log("[CODE_ERROR]",error);
        return new NextResponse("Internal error", {status:500});
    }
}