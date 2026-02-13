import { useParams, useNavigate } from "react-router-dom";
import { useUserDetail } from "./hooks/useUserDetail";

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading, error } = useUserDetail(id);

  if (loading) {
    return (
      <div
        className="flex h-64 items-center justify-center rounded-xl"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <span style={{ color: "var(--color-text-secondary)" }}>Loading...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="flex h-64 items-center justify-center rounded-xl"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <span style={{ color: "var(--color-text-secondary)" }}>
          {error ?? "User not found"}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <nav
          className="text-sm"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <span
            className="cursor-pointer hover:underline"
            onClick={() => navigate("/users")}
            style={{ color: "var(--color-text-secondary)" }}
          >
            Users
          </span>
          <span className="mx-2">{">"}</span>
          <span style={{ color: "var(--color-text)" }}>Detail</span>
        </nav>

        <button
          onClick={() => navigate("/users")}
          className="px-6 py-2 text-sm font-semibold rounded-lg text-white transition-colors hover:opacity-90"
          style={{ background: "var(--color-primary)" }}
        >
          Back
        </button>
      </div>

      {/* Information Section */}
      <div
        className="p-6 rounded-xl"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <h2
          className="text-lg font-bold mb-4"
          style={{ color: "var(--color-primary)" }}
        >
          Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
          <InfoRow label="ID:" value={user.accountId.toString()} />
          <InfoRow label="Name:" value={user.username} />
          <InfoRow label="Gmail:" value={user.email} />
          <InfoRow label="Phone number:" value={user.phoneNumber || "..."} />
          <InfoRow
            label="Date created:"
            value={
              user.createDate
                ? new Date(user.createDate).toLocaleDateString()
                : "..."
            }
          />
          <InfoRow
            label="Language learning:"
            value={user.languageLearning || "..."}
          />
          <InfoRow
            label="Natural Language:"
            value={user.naturalLanguage || "..."}
          />
          <InfoRow label="Proficiency:" value={user.proficiency || "..."} />
        </div>
      </div>

      {/* Payment Section */}
      <div
        className="p-6 rounded-xl"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <h2
          className="text-lg font-bold mb-4"
          style={{ color: "var(--color-primary)" }}
        >
          Payment
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transaction History Table */}
          <div
            className="overflow-hidden rounded-lg"
            style={{
              border: "1px solid var(--color-border)",
            }}
          >
            <table className="min-w-full">
              <thead
                style={{
                  background: "var(--color-primary)",
                  color: "white",
                }}
              >
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-bold">
                    Time ↓
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-bold">
                    Type
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-bold">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody
                className="divide-y"
                style={{ borderColor: "var(--color-border)" }}
              >
                {user.transactions && user.transactions.length > 0 ? (
                  user.transactions.map((transaction, idx) => (
                    <tr
                      key={transaction.id}
                      style={{
                        background: idx % 2 === 0 ? "#FFF9F9" : "white",
                      }}
                    >
                      <td className="px-4 py-2.5 text-sm">
                        {new Date(transaction.time).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2.5 text-sm">
                        {transaction.type}
                      </td>
                      <td className="px-4 py-2.5 text-sm">
                        {transaction.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-8 text-center text-sm"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      No transactions
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Packages Table */}
          <div
            className="overflow-hidden rounded-lg"
            style={{
              border: "1px solid var(--color-border)",
            }}
          >
            <table className="min-w-full">
              <thead
                style={{
                  background: "var(--color-primary)",
                  color: "white",
                }}
              >
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-bold">
                    Type
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-bold">
                    Unit price
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-bold">
                    Quantity
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-bold">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody
                className="divide-y"
                style={{ borderColor: "var(--color-border)" }}
              >
                {user.packages && user.packages.length > 0 ? (
                  <>
                    {user.packages.map((pkg, idx) => (
                      <tr
                        key={idx}
                        style={{
                          background: idx % 2 === 0 ? "#FFF9F9" : "white",
                        }}
                      >
                        <td className="px-4 py-2.5 text-sm">{pkg.type}</td>
                        <td className="px-4 py-2.5 text-sm">
                          {pkg.unitPrice.toLocaleString()}
                        </td>
                        <td className="px-4 py-2.5 text-sm">x{pkg.quantity}</td>
                        <td className="px-4 py-2.5 text-sm">
                          {pkg.total.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    <tr
                      style={{
                        background: "var(--color-surface)",
                        fontWeight: "600",
                      }}
                    >
                      <td
                        colSpan={3}
                        className="px-4 py-2.5 text-sm text-right"
                      >
                        Total
                      </td>
                      <td className="px-4 py-2.5 text-sm">
                        {user.packages
                          .reduce((sum, pkg) => sum + pkg.total, 0)
                          .toLocaleString()}
                      </td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-sm"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      No packages
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for info rows
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="text-sm font-semibold"
        style={{ color: "var(--color-text)" }}
      >
        {label}
      </span>
      <span
        className="text-sm"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {value}
      </span>
    </div>
  );
}
