// @mui
import {
  Box,
  Card,
  Table,
  Stack,
  Avatar,
  TableRow,
  TableBody,
  TableCell,
  Typography,
  TableContainer,
  Modal,
  Pagination,
} from "@mui/material";

// components
import { Api } from "src/webservices";
import Scrollbar from "../../components/scrollbar";
import { TableHeadCustom } from "../../components/table";
import React, { useEffect, useState, useCallback } from "react";
import { fDateTime } from "src/utils/formatTime";
import useResponsive from "src/hooks/useResponsive";
import { CustomAvatar } from "src/components/custom-avatar";
import { fIndianCurrency } from "src/utils/formatNumber";
import CustomPagination from "src/components/customFunctions/CustomPagination";

// ----------------------------------------------------------------------

type RowProps = {
  schemeId: number;
  main_wallet_amount: number;
  id: string;
  name: string;
  firstName: string;
  email: string;
  city: string;
  mobileVerify: boolean;
  emailVerify: boolean;
  _id: any;
  verificationStatus: string;
  avatar: string;
  category: string;
  flag: string;
  total: number;
  rank: string;
  finalStatus: string;
  userCode: string;
  contact_no: string;
  role: string;
  createdAt: string;
  selfie: any;
  AEPS_wallet_amount: any;
};

export default function AllDistributor() {
  const [appdata, setAppdata] = useState([]);
  const isMobile = useResponsive("up", "sm");
  const [open, setModalEdit] = React.useState(false);
  const [pageSize, setPageSize] = useState<any>(25);
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [TotalCount, setTotalCount] = useState<any>(0);
  const [pageSizeAgent, setPageSizeAgent] = useState<any>(25);
  const [currentPageAgent, setCurrentPageAgent] = useState<any>(1);
  const [TotalCountAgnet, setTotalCountAgnet] = useState<any>(0);
  const [selectedRow, setSelectedRow] = useState<RowProps | null>(null);

  const [SelectAgent, setSelectAgent] = useState([]);
  console.log("========== SelectAgent==============", SelectAgent);

  const openEditModal = (val: any) => {
    setSelectedRow(val);
    setModalEdit(true);

    let token = localStorage.getItem("token");
    Api(
      `agent/get_Distributors_All_Agents?distId=${val._id}&page=${currentPageAgent}&limit=${pageSizeAgent}`,
      "GET",
      "",
      token
    ).then((Response: any) => {
      console.log("==============Agent Details=====>", Response.data.data);
      if (Response.status == 200) {
        if (Response.data.code == 200) {
          setTotalCountAgnet(Response?.data?.count);
          setSelectAgent(Response.data.data);
          console.log("=========Agent====>", Response.data.data);
        } else {
          console.log("======Agent List=======>" + Response);
        }
      }
    });
  };

  const handleClose = () => setModalEdit(false);

  const tableLabels: any = [
    { id: "product", label: "Name" },
    { id: "due", label: "User Code" },
    { id: "mobileNumber", label: "Mobile Number & email" },
    { id: "main_wallet_amount", label: "Current Balance" },
    { id: "maxComm", label: "Member Since" },
    { id: "schemeId", label: "Scheme Id" },
    { id: "status", label: "Status" },
  ];

  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "#FFF",
    boxShadow: 10,
    overflow: "auto",
    borderRadius: "20px",
  };

  useEffect(() => {
    allDistributor();
  }, [pageSize, currentPage]);

  const allDistributor = () => {
    let token = localStorage.getItem("token");
    Api(
      `agent/get_All_Distributor?page=${currentPage}&limit=${pageSize}`,
      "GET",
      "",
      token
    ).then((Response: any) => {
      console.log("======ApprovedList==User==response=====>" + Response);

      if (Response.status == 200) {
        if (Response.data.code == 200) {
          let arr: any = [];
          setTotalCount(Response?.data?.count);
          arr = Response.data.data.filter((item: any) => {
            return (
              (item.role == "agent" && item.referralCode != "") ||
              item.role == "distributor" ||
              item.role == "m_distributor"
            );
          });
          setAppdata(arr);
          console.log(
            "======ApprovedList===data.data udata====>",
            Response.data.data
          );
        } else {
          console.log("======ApprovedList=Error======>" + Response);
        }
      }
    });
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setCurrentPage(value);
  };

  return (
    <>
      <Card>
        <TableContainer>
          <Scrollbar
            sx={{ maxHeight: window.innerHeight - (isMobile ? 140 : 50) }}
          >
            <Table sx={{ minWidth: 720, mb: 8 }}>
              <TableHeadCustom headLabel={tableLabels} />

              <TableBody>
                {appdata.map((row) => (
                  <EcommerceBestSalesmanRow
                    key={row}
                    row={row}
                    openEditModal={openEditModal}
                  />
                ))}
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>
        <CustomPagination
          page={currentPage - 1}
          count={TotalCount}
          onPageChange={(
            event: React.MouseEvent<HTMLButtonElement> | null,
            newPage: number
          ) => {
            setCurrentPage(newPage + 1);
          }}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(
            event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
          ) => {
            setPageSize(parseInt(event.target.value));
            setCurrentPage(1);
          }}
        />
      </Card>

      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          {selectedRow && (
            <Card sx={{ width: "90vw" }}>
              <TableContainer>
                <Scrollbar sx={{ height: "70vh", overflowY: "scroll" }}>
                  <Table sx={{ minWidth: 720, mb: 8 }}>
                    <TableHeadCustom headLabel={tableLabels} />

                    <TableBody>
                      {SelectAgent.map((row) => (
                        <EcommerceBestSalesmanRow
                          key={row}
                          row={row}
                          openEditModal={openEditModal}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </Scrollbar>
              </TableContainer>
              <CustomPagination
                page={currentPageAgent - 1}
                count={TotalCountAgnet}
                onPageChange={(
                  event: React.MouseEvent<HTMLButtonElement> | null,
                  newPage: number
                ) => {
                  setCurrentPageAgent(newPage + 1);
                }}
                rowsPerPage={pageSizeAgent}
                onRowsPerPageChange={(
                  event: React.ChangeEvent<
                    HTMLInputElement | HTMLTextAreaElement
                  >
                ) => {
                  setPageSizeAgent(parseInt(event.target.value));
                  setCurrentPageAgent(1);
                }}
              />
            </Card>
          )}
        </Box>
      </Modal>
    </>
  );
}

type EcommerceBestSalesmanRowProps = {
  row: RowProps;
  openEditModal: (row: RowProps) => void;
};

function EcommerceBestSalesmanRow({
  row,
  openEditModal,
}: EcommerceBestSalesmanRowProps) {
  return (
    <TableRow onClick={() => openEditModal(row)}>
      <TableCell>
        <Stack direction="row" alignItems="center">
          <CustomAvatar
            alt={row.firstName}
            src={row.selfie[0]}
            name={row.firstName}
          />

          <Box sx={{ ml: 2 }}>
            <Typography variant="subtitle2"> {row.firstName} </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {row.email}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {new Date(row.createdAt).toLocaleString()}
            </Typography>
          </Box>
        </Stack>
      </TableCell>

      <TableCell>{row.userCode != "" ? row.userCode : "NA"}</TableCell>
      <TableCell>
        {row.email}
        <br />
        {row.contact_no}
      </TableCell>
      <TableCell sx={{ color: "#0D571C" }}>
        <Typography>
          {" "}
          Rs.{fIndianCurrency(row?.main_wallet_amount || "0")}
        </Typography>
      </TableCell>
      <TableCell>{fDateTime(row.createdAt)}</TableCell>
      <TableCell>{row.schemeId}</TableCell>
      <TableCell align="right">{row.verificationStatus}</TableCell>
    </TableRow>
  );
}
