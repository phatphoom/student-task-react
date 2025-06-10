import React from "react";
import Link from "next/link";

type Props = {
  onManageClick: () => void;
  onReportClick: () => void;
};

const SidebarMenu: React.FC<Props> = ({ onManageClick, onReportClick }) => (
  <div className="sidebar-menu">
    <Link href="/" className="btn-manage">Manage</Link>
    <Link href="/Reports" className="btn-report">Report</Link>
  </div>
);

export default SidebarMenu;
