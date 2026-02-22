export default function ConfirmLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen flex items-start justify-center px-4 py-8">
			<div className="w-full max-w-lg">{children}</div>
		</div>
	);
}
