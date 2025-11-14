import { Button, Card, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { format } from "date-fns";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import pathMappings from "../../utils/pathMappings.json";

interface LogsModalProps {
  open?: boolean;
  handleClose?: () => void;
  data?: any;
}

interface LogChangeGroupProps {
  title: string;
  changes: any[];
}

const LogChangeItem = ({ change }: { change: any }) => {
  const { t } = useTranslation();

  const formatValue = (value: any): string => {
    if (value === undefined || value === null || value === "") return "N/A";
    if (typeof value === "string" && value.includes("T")) {
      const datePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
      if (datePattern.test(value)) {
        return new Date(value).toLocaleString();
      }
      return value.toString();
    }
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "object") return JSON.stringify(value);
    return value.toString();
  };

  const getPathDisplayName = () => {
    const cleanPath = change.path
      .replace(/\.\d+\./g, ".") // Handles cases like path.0.field
      .replace(/\.\d+$/g, "") // Handles cases like path.0
      .replace(/\[\d+\]/g, ""); // Handles cases like path[0]

    // @ts-expect-error
    return pathMappings[cleanPath] || cleanPath;
  };

  const getDisplayText = () => {
    const displayName = getPathDisplayName();
    let text = (
      <span>
        {displayName} from <strong>{formatValue(change.from)}</strong> to{" "}
        <strong>{formatValue(change.to)}</strong>
        {change.location && ` at ${change.location.name}`}
      </span>
    );

    return text;
  };

  return (
    <Box
      component="li"
      sx={{
        color: "#333",
        fontSize: "14px",
        lineHeight: "1.8",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell',
      }}
    >
      {getDisplayText()}
    </Box>
  );
};

const LogChangeGroup = ({ title, changes }: LogChangeGroupProps) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        sx={{
          fontWeight: 500,
          fontSize: "16px",
          mb: 1,
          color: "#555",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell',
        }}
      >
        {title}
      </Typography>
      <Box
        component="ul"
        sx={{
          listStyle: "disc",
          pl: 4,
          m: 0,
          "& li": {
            pb: 1,
          },
        }}
      >
        {changes.map((change: any, index: number) => (
          <LogChangeItem key={index} change={change} />
        ))}
      </Box>
    </Box>
  );
};

export const AuditLogModal: React.FC<LogsModalProps> = ({
  open,
  data,
  handleClose,
}) => {
  const { t } = useTranslation();
  const [, setBackDrop] = useState(false);

  const onClose = (event: {}, reason: "backdropClick" | "escapeKeyDown") => {
    if (reason === "backdropClick") {
    } else {
      setBackDrop(false);
    }
  };

  const handleBackdropClick = (event: any) => {
    event.stopPropagation();
    return false;
  };

  const parseChanges = (updatedFields: any) => {
    if (!updatedFields) return [];
    if (typeof updatedFields === "string") {
      try {
        return JSON.parse(updatedFields);
      } catch (e) {
        console.error("Error parsing updatedFields:", e);
        return [];
      }
    }
    return updatedFields;
  };

  const groupChangesByPath = (changes: any[]) => {
    const groups: { [key: string]: any[] } = {};
    changes.forEach((change) => {
      const basePath = change.path.split(".")[0];
      if (!groups[basePath]) {
        groups[basePath] = [];
      }
      groups[basePath].push(change);
    });
    return groups;
  };

  const changes = parseChanges(data?.updatedFields);
  const groupedChanges = groupChangesByPath(changes);

  const getHeaderText = () => {
    const lastUpdatedBy = data?.lastUpdatedBy?.name || "System";
    const entityName = data?.entityName || "record";
    const recordId = data?.recordId || "#Unknown";
    const recordName = data?.recordName?.en || "N/A";
    return `${lastUpdatedBy} changed ${entityName} ${recordName} - ${recordId}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd/MM/yyyy, h:mma");
    } catch (e) {
      return "Invalid Date";
    }
  };

  return (
    <Box>
      <Modal
        open={open}
        onClose={onClose}
        onBackdropClick={handleBackdropClick}
        disableEscapeKeyDown
      >
        <Card
          sx={{
            position: "absolute" as "absolute",
            top: "50%",
            left: "50%",
            minHeight: "40%",
            maxHeight: "80%",
            transform: "translate(-50%, -50%)",
            width: {
              xs: "95vw",
              sm: "70vw",
              md: "55vw",
              lg: "50vw",
            },
            bgcolor: "background.paper",
            overflowY: "hidden",
            p: 4,
          }}
        >
          <Box sx={{ width: "100%", display: "flex" }}>
            <XCircle
              fontSize="small"
              onClick={handleClose}
              style={{ cursor: "pointer" }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h6"
                align="left"
                sx={{
                  ml: 2,
                  mb: 3,
                  fontWeight: 500,
                  fontSize: "20px",
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell',
                }}
              >
                {getHeaderText()}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ overflowY: "auto", maxHeight: 600, px: 2 }}>
            {Object.keys(groupedChanges).length > 0 ? (
              <>
                <Box>
                  {Object.entries(groupedChanges).map(
                    ([path, groupChanges], index) => (
                      <LogChangeGroup
                        key={index}
                        title={path.charAt(0).toUpperCase() + path.slice(1)}
                        changes={groupChanges}
                      />
                    )
                  )}
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography
                    sx={{
                      fontWeight: 500,
                      fontSize: "16px",
                      mb: 1,
                      color: "#555",
                      fontFamily:
                        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell',
                    }}
                  >
                    Date
                  </Typography>
                  <Box
                    component="ul"
                    sx={{
                      listStyle: "disc",
                      pl: 4,
                      m: 0,
                      "& li": {
                        pb: 1,
                      },
                    }}
                  >
                    <Box
                      component="li"
                      sx={{
                        color: "#333",
                        fontSize: "14px",
                        lineHeight: "1.8",
                        fontFamily:
                          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell',
                      }}
                    >
                      {formatDate(data?.createdAt)}
                    </Box>
                  </Box>
                </Box>
              </>
            ) : (
              <Typography sx={{ pl: 2, color: "text.secondary" }}>
                No changes recorded
              </Typography>
            )}
          </Box>
        </Card>
      </Modal>
    </Box>
  );
};

export default AuditLogModal;
