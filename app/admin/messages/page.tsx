import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/dbConnect";
import ContactMessage, { IContactMessage } from "@/models/ContactMessage"; // ✅ استيراد النوع
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import BulkDeleteWrapper from "@/app/admin/messages/BulkDeleteWrapper";
import { headers } from "next/headers";
import type { FilterQuery } from "mongoose";
import { FaUserShield } from "react-icons/fa";


type ContactMessageDTO = {
  _id: string;
  username: string;
  content: string;
  createdAt: Date;
};

export default async function MessagesPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.groupid !== 10) {
    redirect("/login");
  }

  await dbConnect();

  const headersList = await headers();
  const refererUrl = headersList.get("referer") || "http://localhost:3000/admin/messages";
  const parsedUrl = new URL(refererUrl);

  const search = parsedUrl.searchParams.get("q")?.trim() || "";
  const startDate = parsedUrl.searchParams.get("start") || "";
  const endDate = parsedUrl.searchParams.get("end") || "";
  const currentPage = parseInt(parsedUrl.searchParams.get("page") || "1", 10);
  const messagesPerPage = 5;

  const query: FilterQuery<IContactMessage> = {}; // ✅ استخدام النوع الصحيح
  if (search) {
    query.username = { $regex: search, $options: "i" };
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      query.createdAt.$lte = new Date(endDate);
    }
  }

  const totalMessages = await ContactMessage.countDocuments(query);
  const totalPages = Math.ceil(totalMessages / messagesPerPage);

  const messagesRaw = await ContactMessage.find(query)
    .sort({ createdAt: -1 })
    .skip((currentPage - 1) * messagesPerPage)
    .limit(messagesPerPage)
    .lean();

  const messages: ContactMessageDTO[] = messagesRaw.map((msg) => ({
    _id: String(msg._id),
    username: msg.username,
    content: msg.content,
    createdAt: msg.createdAt,
  }));

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">لوحة رسائل المستخدمين</h1>

      <form method="GET" className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
        <Input name="q" placeholder="ابحث باسم المستخدم" defaultValue={search} />
        <Input type="date" name="start" defaultValue={startDate} />
        <Input type="date" name="end" defaultValue={endDate} />
        <Button type="submit">تصفية</Button>
      </form>


      <Link href="/admin">
        <Button className="mb-4 bg-black text-white hover:bg-gray-800 cursor-pointer flex items-center gap-2">
          <FaUserShield className="text-lg" />
          المشرف
        </Button>
      </Link>

      {messages.length === 0 ? (
        <p className="text-center text-gray-500">لا توجد رسائل مطابقة.</p>
      ) : (
        <BulkDeleteWrapper messages={messages} />
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <Link
              key={i}
              href={`/admin/messages?q=${search}&start=${startDate}&end=${endDate}&page=${i + 1}`}
            >
              <Button variant={currentPage === i + 1 ? "default" : "outline"}>
                {i + 1}
              </Button>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
