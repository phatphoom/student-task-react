import React from "react";

type Props = {
  onManageClick: () => void;
  onReportClick: () => void;
};

const SidebarMenu: React.FC<Props> = ({ onManageClick, onReportClick }) => (
  <div className="sidebar-menu">
    <button onClick={onManageClick} className="btn-manage">
      Manage
    </button>
    <button onClick={onReportClick} className="btn-report">
      Report
    </button>
  </div>
);

export default SidebarMenu;
