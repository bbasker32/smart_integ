import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#214389] flex items-center justify-center p-4">
      <div className="w-full max-w-[480px] bg-white rounded-lg p-6 md:p-8 text-center">
        <h1 className="text-[#214389] text-2xl font-semibold mb-4">
          Access Denied
        </h1>
        <p className="text-[#666666] text-lg mb-6">
          You don't have permission to access this page.
        </p>
        <Button
          onClick={() => navigate("/")}
          className="bg-[#214389] text-white hover:bg-[#1a3571]"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
