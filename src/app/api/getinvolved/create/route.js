import { connect } from "@/lib/mongodb/mongoose";
import GetInvolved from "@/lib/models/getinvolved.model";

export async function POST(req) {
try {
const data = await req.json();
await connect();
const newEntry = await GetInvolved.create(data);
return new Response(
JSON.stringify({ message: "Form submitted successfully", newEntry }),
{ status: 201 }
);
} catch (error) {
console.error(" POST error:", error);
return new Response(JSON.stringify({ error: "Internal Server Error" }), {
status: 500,
});
}
}

