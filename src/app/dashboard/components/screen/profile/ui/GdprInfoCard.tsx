import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
} from "@mui/material";
import PrivacyTipIcon from "@mui/icons-material/PrivacyTip";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import {
  GDPRComplianceInformation,
  GDPRCategoryDetail,
  GDPRRecipient,
  GDPRRight,
} from "../ProfileTypes";

/**
 * @typedef {Object} GdprInfoCardProps
 * @property {GDPRComplianceInformation} gdprInfo - The structured GDPR compliance data.
 */
type GdprInfoCardProps = {
  gdprInfo: GDPRComplianceInformation;
};

// Define the complex type for content that can be passed to renderAccordion
type AccordionContent =
  | GDPRComplianceInformation["purposes_of_processing"]
  | GDPRComplianceInformation["categories_of_personal_data"]
  | GDPRComplianceInformation["data_recipients"]
  | GDPRComplianceInformation["data_retention_policy"]
  | GDPRComplianceInformation["your_gdpr_rights"];

/**
 * Helper function to render a single collapsible accordion section based on structured GDPR data.
 * @param {string} title - The title of the accordion.
 * @param {string} description - The high-level description for the section.
 * @param {AccordionContent} content - The detailed, structured content for the section.
 * @returns {JSX.Element} An Accordion component.
 */
const renderAccordion = (
  title: string,
  description: string,
  content: AccordionContent,
) => (
  <Accordion
    key={title}
    sx={{
      mb: 1,
      boxShadow: "none",
      border: "1px solid rgba(0,0,0,0.05)",
      borderRadius: "8px",
      "&::before": { display: "none" },
      "&.Mui-expanded": { m: 0 },
    }}
  >
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
    </AccordionSummary>
    <AccordionDetails>
      <Typography variant="body2" sx={{ mb: 2 }}>
        {description}
      </Typography>
      <List dense disablePadding>
        {/* Iterate over content object entries */}
        {Object.entries(content).map(([key, value]) => {
          // Skip the internal description field
          if (key === "_description") return null;

          // Check for nested object structures
          if (typeof value === "object" && value !== null) {
            // Case 1: Nested structures (Categories and Rights)
            if ("_details" in value) {
              const item = value as GDPRCategoryDetail | GDPRRight;
              return (
                <Box key={key} sx={{ mb: 1.5, pl: 0 }}>
                  <ListItem disablePadding>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight="bold">
                          {key.replace(/_/g, " ")}:
                        </Typography>
                      }
                      secondary={item._details}
                      secondaryTypographyProps={{
                        variant: "caption",
                        ml: 0.5,
                        display: "block",
                      }}
                    />
                  </ListItem>

                  {/* Handle nested fields list if they exist (e.g., in Categories) */}
                  {"fields" in item && Array.isArray(item.fields) && (
                    <List dense sx={{ pl: 1.5 }}>
                      {item.fields.map((field: string) => (
                        <ListItem key={field} disablePadding>
                          <ListItemIcon sx={{ minWidth: "24px" }}>
                            <KeyboardArrowRightIcon
                              fontSize="small"
                              color="action"
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={field}
                            primaryTypographyProps={{ variant: "body2" }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}

                  {/* Handle 'how_to_exercise' if it exists (e.g., in Rights) */}
                  {"how_to_exercise" in item && (
                    <ListItem disablePadding sx={{ mt: 1 }}>
                      <ListItemIcon sx={{ minWidth: "24px" }}>
                        <KeyboardArrowRightIcon
                          fontSize="small"
                          color="action"
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={"How to Exercise:"}
                        secondary={item.how_to_exercise}
                        primaryTypographyProps={{
                          variant: "body2",
                          fontWeight: "bold",
                        }}
                        secondaryTypographyProps={{ variant: "body2" }}
                      />
                    </ListItem>
                  )}
                </Box>
              );
            }

            // Case 2: Data Recipients (separate structure)
            if ("name" in value) {
              const item = value as GDPRRecipient;
              return (
                <ListItem
                  key={key}
                  disablePadding
                  sx={{
                    flexDirection: "column",
                    alignItems: "flex-start",
                    mb: 1.5,
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        sx={{ color: "text.primary" }}
                      >
                        {item.name}:
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography
                          variant="body2"
                          component="span"
                          sx={{ display: "block", ml: 1.5 }}
                        >
                          Purpose: {item.purpose}
                        </Typography>
                        <Typography
                          variant="body2"
                          component="span"
                          sx={{ display: "block", ml: 1.5 }}
                        >
                          Data Shared: {item.data_shared}
                        </Typography>
                      </>
                    }
                    secondaryTypographyProps={{ component: "div" }}
                  />
                </ListItem>
              );
            }
          }

          // Case 3: Default simple key-value pairs (e.g., Purposes, Retention)
          return (
            <ListItem key={key} disablePadding>
              <ListItemIcon sx={{ minWidth: "30px" }}>
                <KeyboardArrowRightIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography
                    variant="body2"
                    component="span"
                    fontWeight="bold"
                  >
                    {key.replace(/_/g, " ")}:
                  </Typography>
                }
                secondary={value as string}
                secondaryTypographyProps={{ variant: "body2" }}
              />
            </ListItem>
          );
        })}
      </List>
    </AccordionDetails>
  </Accordion>
);

/**
 * A card component that presents detailed GDPR compliance information in a series of collapsible sections.
 * @param {GdprInfoCardProps} props - The props for the component.
 * @returns {JSX.Element} The GdprInfoCard component.
 */
export function GdprInfoCard({ gdprInfo }: GdprInfoCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      <CardContent>
        <Box sx={{ p: { xs: 1, sm: 2 } }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 2,
              color: "primary.main",
            }}
          >
            <PrivacyTipIcon color="primary" /> **GDPR Compliance Information**
          </Typography>

          {/* General Note */}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {gdprInfo._note}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            For a more comprehensive understanding of our data processing
            practices, please refer to our full{" "}
            <a
              href="[Link to your Privacy Policy URL]"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: "underline",
                color: "inherit",
              }}
            >
              <Box
                component="span"
                sx={{ color: "primary.main", fontWeight: 600 }}
              >
                Privacy Policy
              </Box>
            </a>
            .
          </Typography>

          {/* Dynamic Accordion Sections */}
          <Box sx={{ mt: 3 }}>
            {renderAccordion(
              "1. Purposes of Processing",
              gdprInfo.purposes_of_processing._description,
              gdprInfo.purposes_of_processing,
            )}
            {renderAccordion(
              "2. Categories of Personal Data",
              gdprInfo.categories_of_personal_data._description,
              gdprInfo.categories_of_personal_data,
            )}
            {renderAccordion(
              "3. Data Recipients",
              gdprInfo.data_recipients._description,
              gdprInfo.data_recipients,
            )}
            {renderAccordion(
              "4. Data Retention Policy",
              gdprInfo.data_retention_policy._description,
              gdprInfo.data_retention_policy,
            )}
            {renderAccordion(
              "5. Your GDPR Rights",
              gdprInfo.your_gdpr_rights._description,
              gdprInfo.your_gdpr_rights,
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
