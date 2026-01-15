const db = require("../../models");
const PlanModel = db.insurance_plans;
const CategoryModel = db.insurance_plan_category;
const BenefitLinkModel = db.insurance_plan_category_benefits;
const EstablishmentLinkModel = db.insurance_plan_establishments;
const PlanSpecialityModel = db.insurance_plan_specialities;
const SpecialityModel = db.insurance_specialities;
const XLSX = require("xlsx");

const { Op } = require("sequelize");
const { responseModel } = require("../../responses");
const { getOffset } = require("../../utils/helper");


async function upsertBenefitFromPayload(b, t) {
  // b can contain: benefit_id, name, description

  if (b.benefit_id) {
    // Existing benefit → update if name/description changed
    const benefit = await db.benefits.findByPk(b.benefit_id, { transaction: t });
    if (!benefit) {
      throw new Error("Benefit not found for id " + b.benefit_id);
    }

    const newName = b.name ? b.name.trim() : benefit.name;
    const newDesc = b.description !== undefined ? b.description : benefit.description;

    // Only update if something changed
    if (newName !== benefit.name || newDesc !== benefit.description) {
      await benefit.update(
        { name: newName, description: newDesc },
        { transaction: t }
      );
    }

    return benefit.id;
  }

  // No id → create or reuse by name
  if (b.name && b.name.trim() !== "") {
    const cleanName = b.name.trim();

    let benefit = await db.benefits.findOne({
      where: { name: cleanName },
      transaction: t
    });

    if (!benefit) {
      benefit = await db.benefits.create(
        {
          name: cleanName,
          description: b.description || null
        },
        { transaction: t }
      );
    } else {
      // Optionally update description if provided
      if (b.description !== undefined && b.description !== benefit.description) {
        await benefit.update(
          { description: b.description },
          { transaction: t }
        );
      }
    }

    return benefit.id;
  }

  throw new Error("Benefit must have either benefit_id or name");
}


class InsurancePlansController {
  constructor() { }

  // --------------------------------------------------
  // LIST PLANS WITH SEARCH + PAGINATION
  // --------------------------------------------------
  async list(req) {
    try {
      const { search_text, page_no = 1, items_per_page = 10, network_id } = req.query;
      const offset = getOffset(+page_no, +items_per_page);

      let whereClause = {};

      if (search_text && search_text.trim() !== "") {
        whereClause.name = { [Op.like]: `%${search_text.trim()}%` };
      }

      if (network_id) {
        whereClause.network_id = network_id;
      }

      const result = await PlanModel.findAndCountAll({
        where: whereClause,
        offset,
        limit: +items_per_page,
        order: [["created_at", "DESC"]],
        include: [
          {
            model: db.insurance_networks,
            as: "network",
            attributes: ["id", "name"],
            include: [
              {
                model: db.insurance_companies,
                as: "company",
                attributes: ["id", "name"]
              }
            ]
          },
          {
            model: db.insurance_specialities,
            as: "specialities",
            attributes: ["id", "name"],
            through: { attributes: [] }
          }
        ],
        distinct: true,
      });

      return responseModel.successResponse(1, "Plans fetched", {
        count: result.count,
        rows: result.rows.map(p => p.toJSON())
      });

    } catch (err) {
      return responseModel.failResponse(0, "Error fetching plans", {}, err.message);
    }
  }

  // --------------------------------------------------
  // SELECT DROPDOWN LIST
  // --------------------------------------------------
  async getPlansForSelect(req) {
    try {
      const { search_text, network_id } = req.query;

      let whereClause = {};

      if (search_text && search_text.trim() !== "") {
        whereClause.name = { [Op.like]: `%${search_text.trim()}%` };
      }

      if (network_id) whereClause.network_id = network_id;

      const plans = await PlanModel.findAll({
        where: whereClause,
        attributes: ["id", "name"]
      });

      return responseModel.successResponse(
        1,
        plans.length ? "Plans fetched" : "No plans found",
        plans
      );

    } catch (err) {
      return responseModel.failResponse(0, "Error", {}, err.message);
    }
  }

  // --------------------------------------------------
  // GET CLEAN PLAN DETAILS (FORMATTED RESPONSE)
  // --------------------------------------------------
  async getById(req) {
    try {
      const id = req.params.id;

      const plan = await PlanModel.findOne({
        where: { id },
        include: [
          {
            model: db.insurance_networks,
            as: "network",
            include: [
              {
                model: db.insurance_companies,
                as: "company"
              }
            ]
          },
          {
            model: CategoryModel,
            as: "categories",
            include: [
              {
                model: BenefitLinkModel,
                as: "benefits",
                include: [
                  {
                    model: db.benefits,
                    as: "benefit"
                  }
                ]
              }
            ]
          },
          {
            model: EstablishmentLinkModel,
            as: "establishments",
            include: [
              {
                model: db.establishments,
                as: "establishment"
              }
            ]
          },
          {
            model: db.insurance_specialities,
            as: "specialities",
            attributes: ["id", "name"],
            through: { attributes: [] }
          },
          {
            model: db.insurance_plan_highlight,
            as: "highlights"
          },
          {
            model: db.insurance_plan_exclusion,
            as: "exclusions"
          },
          {
            model: db.insurance_plan_claim_step,
            as: "claimSteps"
          }
        ]
      });

      if (!plan) {
        return responseModel.validationError(0, "Plan not found", {});
      }

      // -----------------------------
      // FORMAT OUTPUT CLEANLY
      // -----------------------------
      const formatted = {
        id: plan.id,
        name: plan.name,
        annual_limit: plan.annual_limit,
        area_of_cover: plan.area_of_cover,
        sub_title: plan.sub_title,
        description: plan.description,
        selling_price: plan.selling_price,
        strike_price: plan.strike_price,
        cover_amount: plan.cover_amount,
        features: plan.features,
        discount_text: plan.discount_text,
        special_for_customers: plan.special_for_customers,
        recommended: plan.recommended,
        is_dha_approved: plan.is_dha_approved,
        eligibility: plan.eligibility,
        policy_term_years: plan.policy_term_years,
        is_renewable: plan.is_renewable,

        network: plan.network
          ? {
            id: plan.network.id,
            name: plan.network.name,
            company: plan.network.company
              ? {
                id: plan.network.company.id,
                name: plan.network.company.name
              }
              : null
          }
          : null,

        categories: {}
      };

      // Convert category array → object by category_name
      for (const cat of plan.categories) {
        formatted.categories[cat.category_name] = {
          description: cat.description,
          co_payment: cat.co_payment,
          co_payment_info: cat.co_payment_info,
          benefits: cat.benefits.map(b => ({
            id: b.benefit.id,
            name: b.benefit.name,
            description: b.benefit.description,
            included: b.included,
            notes: b.notes
          }))
        };
      }

      // Establishments (trimmed output)
      formatted.establishments = plan.establishments.map(e => ({
        id: e.establishment.id,
        name: e.establishment.name
      }));

      // Specialities
      formatted.specialities = plan.specialities
        ? plan.specialities.map(s => ({
          id: s.id,
          name: s.name
        }))
        : [];

      // Highlights
      formatted.highlights = plan.highlights || [];

      // Exclusions
      formatted.exclusions = plan.exclusions || [];

      // Claim Steps
      formatted.claimSteps = plan.claimSteps || [];

      return responseModel.successResponse(1, "Plan data fetched", formatted);

    } catch (err) {
      return responseModel.failResponse(0, "Error fetching plan details", {}, err.message);
    }
  }


  // --------------------------------------------------
  // AUTOCOMPLETE BENEFIT SEARCH
  // --------------------------------------------------
  async searchBenefits(req) {
    try {
      const { search_text = "" } = req.query;

      const benefits = await db.benefits.findAll({
        where: { name: { [Op.like]: `%${search_text}%` } },
        attributes: ["id", "name"],
        limit: 20
      });

      return responseModel.successResponse(
        1,
        "Benefits fetched",
        benefits
      );

    } catch (err) {
      return responseModel.failResponse(0, "Error", {}, err.message);
    }
  }

  // --------------------------------------------------
  // CREATE PLAN (WITH 4 CATEGORIES + BENEFITS)
  // --------------------------------------------------
  async store(req) {
    let t;
    try {
      t = await db.sequelize.transaction();

      const {
        network_id,
        name,
        annual_limit,
        area_of_cover,
        sub_title,
        description,
        selling_price,
        strike_price,
        cover_amount,
        features,
        discount_text,
        special_for_customers,
        recommended,
        is_dha_approved,
        eligibility,
        policy_term_years,
        is_renewable,
        categories = {},
        highlights = [],
        exclusions = [],
        claimSteps = []
      } = req.body;

      // Create plan base
      const plan = await PlanModel.create(
        {
          network_id, name, annual_limit, area_of_cover,
          sub_title, description, selling_price, strike_price,
          cover_amount, features, discount_text, special_for_customers, recommended,
          is_dha_approved, eligibility, policy_term_years, is_renewable
        },
        { transaction: t }
      );

      const CATEGORY_NAMES = ["inpatient", "outpatient", "optical", "dental"];

      for (const cat of CATEGORY_NAMES) {
        const data = categories[cat];
        if (!data) continue;

        // Create category
        const category = await CategoryModel.create(
          {
            plan_id: plan.id,
            category_name: cat,
            description: data.description,
            co_payment: data.co_payment,
            co_payment_info: data.co_payment_info
          },
          { transaction: t }
        );

        // 4️⃣ Create benefit links
        if (Array.isArray(data.benefits) && data.benefits.length > 0) {
          for (const b of data.benefits) {
            const benefitId = await upsertBenefitFromPayload(b, t);

            await BenefitLinkModel.create(
              {
                plan_category_id: category.id,
                benefit_id: benefitId,
                included: b.included ?? true,
                notes: b.notes || null
              },
              { transaction: t }
            );
          }
        }
      }

      // --------------------------------------------------
      // SAVE SPECIALITIES MAPPING
      // --------------------------------------------------
      if (req.body.specialities && Array.isArray(req.body.specialities)) {
        const specialityData = req.body.specialities.map(sid => ({
          plan_id: plan.id,
          speciality_id: sid
        }));

        await db.insurance_plan_specialities.bulkCreate(specialityData, { transaction: t });
      }

      // --------------------------------------------------
      // SAVE ESTABLISHMENTS MAPPING
      // --------------------------------------------------
      if (req.body.establishments && Array.isArray(req.body.establishments)) {
        const estData = req.body.establishments.map(eid => ({
          plan_id: plan.id,
          establishment_id: eid
        }));

        await db.insurance_plan_establishments.bulkCreate(estData, { transaction: t });
      }

      // Highlights
      if (highlights.length > 0) {
        const highlightData = highlights.map(h => ({ ...h, plan_id: plan.id }));
        await db.insurance_plan_highlight.bulkCreate(highlightData, { transaction: t });
      }

      // Exclusions
      if (exclusions.length > 0) {
        const exclusionData = exclusions.map(e => ({ ...e, plan_id: plan.id }));
        await db.insurance_plan_exclusion.bulkCreate(exclusionData, { transaction: t });
      }

      // Claim Steps
      if (claimSteps.length > 0) {
        const claimStepData = claimSteps.map(cs => ({ ...cs, plan_id: plan.id }));
        await db.insurance_plan_claim_step.bulkCreate(claimStepData, { transaction: t });
      }

      // 5️⃣ Commit insert
      await t.commit();

      // 6️⃣ Reload full nested structure for response
      const createdPlan = await PlanModel.findOne({
        where: { id: plan.id },
        include: [
          {
            model: CategoryModel,
            as: "categories",
            include: [
              {
                model: BenefitLinkModel,
                as: "benefits",
                include: [
                  {
                    model: db.benefits,
                    as: "benefit"
                  }
                ]
              }
            ]
          }
        ]
      });

      return responseModel.successResponse(
        1,
        "Plan created successfully",
        createdPlan
      );

    } catch (err) {
      console.log("REAL ERROR:", err.message)

      if (t && !t.finished) await t.rollback();
      return responseModel.failResponse(
        0,
        "Plan creation failed",
        {},
        err.message,
      );
    }
  }

  // --------------------------------------------------
  // UPDATE PLAN (WITH CATEGORIES + BENEFITS)
  // --------------------------------------------------
  async update(req) {
    let t;
    try {
      t = await db.sequelize.transaction();

      const id = req.params.id;
      const {
        network_id,
        name,
        annual_limit,
        area_of_cover,
        sub_title,
        description,
        selling_price,
        strike_price,
        cover_amount,
        features,
        discount_text,
        special_for_customers,
        recommended,
        is_dha_approved,
        eligibility,
        policy_term_years,
        is_renewable,
        categories = {},
        highlights,
        exclusions,
        claimSteps
      } = req.body;

      const plan = await PlanModel.findByPk(id, { transaction: t });
      if (!plan) {
        await t.rollback();
        return responseModel.validationError(0, "Plan not found");
      }

      // Update plan base data INCLUDING network_id
      await plan.update(
        {
          network_id: network_id ?? plan.network_id,
          name: name ?? plan.name,
          annual_limit: annual_limit ?? plan.annual_limit,
          area_of_cover: area_of_cover ?? plan.area_of_cover,
          sub_title: sub_title ?? plan.sub_title,
          description: description ?? plan.description,
          selling_price: selling_price ?? plan.selling_price,
          strike_price: strike_price ?? plan.strike_price,
          cover_amount: cover_amount ?? plan.cover_amount,
          features: features ?? plan.features,
          discount_text: discount_text ?? plan.discount_text,
          special_for_customers: special_for_customers ?? plan.special_for_customers,
          recommended: recommended ?? plan.recommended,
          is_dha_approved: is_dha_approved ?? plan.is_dha_approved,
          eligibility: eligibility ?? plan.eligibility,
          policy_term_years: policy_term_years ?? plan.policy_term_years,
          is_renewable: is_renewable ?? plan.is_renewable
        },
        { transaction: t }
      );

      const CATEGORY_NAMES = ["inpatient", "outpatient", "optical", "dental"];

      // Existing categories fetched once
      const oldCategories = await CategoryModel.findAll({
        where: { plan_id: id },
        transaction: t
      });

      // Map for easy lookup
      const oldCategoryMap = {};
      oldCategories.forEach(cat => {
        oldCategoryMap[cat.category_name] = cat;
      });

      // Process each category
      for (const catName of CATEGORY_NAMES) {
        const data = categories[catName];

        // If category not sent => skip it
        if (!data) continue;

        let category = oldCategoryMap[catName];

        // Create new category if missing
        if (!category) {
          category = await CategoryModel.create(
            {
              plan_id: plan.id,
              category_name: catName,
              description: data.description,
              co_payment: data.co_payment,
              co_payment_info: data.co_payment_info
            },
            { transaction: t }
          );
        } else {
          // Update category
          await category.update(
            {
              description: data.description ?? category.description,
              co_payment: data.co_payment ?? category.co_payment,
              co_payment_info: data.co_payment_info ?? category.co_payment_info
            },
            { transaction: t }
          );
        }

        // ----------------------------------------
        // BENEFITS LOGIC (UPSERT)
        // ----------------------------------------

        const oldLinks = await BenefitLinkModel.findAll({
          where: { plan_category_id: category.id },
          transaction: t
        });

        const oldLinkMap = {};
        oldLinks.forEach(l => {
          oldLinkMap[l.benefit_id] = l;
        });

        const newBenefitIds = [];

        // Loop through new benefits
        for (const b of data.benefits || []) {
          const benefitId = await upsertBenefitFromPayload(b, t);
          newBenefitIds.push(benefitId);

          const existingLink = oldLinkMap[benefitId];

          if (existingLink) {
            // UPDATE the link
            await existingLink.update(
              {
                included: b.included ?? existingLink.included,
                notes: b.notes ?? existingLink.notes
              },
              { transaction: t }
            );
          } else {
            // CREATE new link
            await BenefitLinkModel.create(
              {
                plan_category_id: category.id,
                benefit_id: benefitId,
                included: b.included ?? true,
                notes: b.notes || null
              },
              { transaction: t }
            );
          }
        }

        // DELETE removed benefits
        await BenefitLinkModel.destroy({
          where: {
            plan_category_id: category.id,
            benefit_id: { [Op.notIn]: newBenefitIds }
          },
          transaction: t
        });
      }

      // --------------------------------------------------
      // UPDATE SPECIALITIES MAPPING
      // --------------------------------------------------
      if (req.body.specialities && Array.isArray(req.body.specialities)) {

        // Delete old mappings
        await db.insurance_plan_specialities.destroy({
          where: { plan_id: id },
          transaction: t
        });

        // Insert new mappings
        const specialityData = req.body.specialities.map(sid => ({
          plan_id: id,
          speciality_id: sid
        }));

        await db.insurance_plan_specialities.bulkCreate(specialityData, { transaction: t });
      }

      // --------------------------------------------------
      // UPDATE ESTABLISHMENTS MAPPING
      // --------------------------------------------------
      if (req.body.establishments && Array.isArray(req.body.establishments)) {
        // Remove old links
        await db.insurance_plan_establishments.destroy({
          where: { plan_id: id },
          transaction: t
        });

        // Insert new links
        const estData = req.body.establishments.map(eid => ({
          plan_id: id,
          establishment_id: eid
        }));

        await db.insurance_plan_establishments.bulkCreate(estData, { transaction: t });
      }

      // Sync Highlights
      if (highlights !== undefined) {
        await db.insurance_plan_highlight.destroy({ where: { plan_id: id }, transaction: t });
        if (Array.isArray(highlights) && highlights.length > 0) {
          const highlightData = highlights.map(h => ({ ...h, plan_id: id }));
          await db.insurance_plan_highlight.bulkCreate(highlightData, { transaction: t });
        }
      }

      // Sync Exclusions
      if (exclusions !== undefined) {
        await db.insurance_plan_exclusion.destroy({ where: { plan_id: id }, transaction: t });
        if (Array.isArray(exclusions) && exclusions.length > 0) {
          const exclusionData = exclusions.map(e => ({ ...e, plan_id: id }));
          await db.insurance_plan_exclusion.bulkCreate(exclusionData, { transaction: t });
        }
      }

      // Sync Claim Steps
      if (claimSteps !== undefined) {
        await db.insurance_plan_claim_step.destroy({ where: { plan_id: id }, transaction: t });
        if (Array.isArray(claimSteps) && claimSteps.length > 0) {
          const claimStepData = claimSteps.map(cs => ({ ...cs, plan_id: id }));
          await db.insurance_plan_claim_step.bulkCreate(claimStepData, { transaction: t });
        }
      }

      await t.commit();
      return responseModel.successResponse(
        1,
        "Plan updated successfully",
        {}
      );

    } catch (err) {
      if (t) await t.rollback();
      return responseModel.failResponse(0, "Plan update failed", {}, err.message);
    }
  }


  // --------------------------------------------------
  // DELETE PLAN
  // --------------------------------------------------
  async destroy(req) {
    let t;
    try {
      t = await db.sequelize.transaction();
      const id = req.params.id;

      const categories = await CategoryModel.findAll({
        where: { plan_id: id },
        transaction: t
      });

      for (const cat of categories) {
        await BenefitLinkModel.destroy({
          where: { plan_category_id: cat.id },
          transaction: t
        });
      }

      await CategoryModel.destroy({
        where: { plan_id: id },
        transaction: t
      });

      await EstablishmentLinkModel.destroy({
        where: { plan_id: id },
        transaction: t
      });

      await db.insurance_plan_specialities.destroy({
        where: { plan_id: id },
        transaction: t
      });

      await db.insurance_plan_highlight.destroy({
        where: { plan_id: id },
        transaction: t
      });

      await db.insurance_plan_exclusion.destroy({
        where: { plan_id: id },
        transaction: t
      });

      await db.insurance_plan_claim_step.destroy({
        where: { plan_id: id },
        transaction: t
      });

      await PlanModel.destroy({ where: { id }, transaction: t });

      await t.commit();
      return responseModel.successResponse(1, "Plan deleted successfully", {});

    } catch (err) {
      if (t) await t.rollback();
      return responseModel.failResponse(0, "Plan deletion failed", {}, err.message);
    }
  }

  // --------------------------------------------------
  // BULK UPLOAD PLANS FROM EXCEL
  // --------------------------------------------------
  async bulkUpload(req) {
    let t;
    try {
      if (!req.file) {
        return responseModel.validationError(0, "Excel file is required");
      }

      const workbook = XLSX.readFile(req.file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);

      if (!rows.length) {
        return responseModel.validationError(0, "Excel sheet is empty");
      }

      t = await db.sequelize.transaction();

      const failedRows = [];
      const successRows = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        try {
          //---------------------------------------------
          // VALIDATE REQUIRED COLUMNS
          //---------------------------------------------
          if (!row.company_name || !row.network_name || !row.plan_name) {
            failedRows.push({ row: i + 2, reason: "Missing company/network/plan name" });
            continue;
          }

          //---------------------------------------------
          // FIND OR CREATE COMPANY
          //---------------------------------------------
          let company = await db.insurance_companies.findOne({
            where: { name: row.company_name.trim() },
            transaction: t,
          });

          if (!company) {
            company = await db.insurance_companies.create(
              { name: row.company_name.trim() },
              { transaction: t }
            );
          }

          //---------------------------------------------
          // FIND OR CREATE NETWORK
          //---------------------------------------------
          let network = await db.insurance_networks.findOne({
            where: {
              name: row.network_name.trim(),
              company_id: company.id,
            },
            transaction: t,
          });

          if (!network) {
            network = await db.insurance_networks.create(
              {
                name: row.network_name.trim(),
                company_id: company.id,
              },
              { transaction: t }
            );
          }

          //---------------------------------------------
          // CREATE PLAN
          //---------------------------------------------
          const plan = await PlanModel.create(
            {
              network_id: network.id,
              name: row.plan_name.trim(),
              annual_limit: row.annual_limit || "",
              area_of_cover: row.area_of_cover || "",
            },
            { transaction: t }
          );

          //---------------------------------------------
          // CATEGORY HANDLER FUNCTION
          //---------------------------------------------
          const createCategory = async (type, desc, copay, benefitsCSV) => {
            if (!desc && !benefitsCSV) return;

            const category = await CategoryModel.create(
              {
                plan_id: plan.id,
                category_name: type,
                description: desc || "",
                co_payment: copay?.toString().toLowerCase().includes("yes") ?? false,
                co_payment_info: copay || "",
              },
              { transaction: t }
            );

            if (benefitsCSV) {
              const items = String(benefitsCSV || "")
                .split(",")
                .map((b) => b.trim())
                .filter((b) => b);

              for (const name of items) {
                let benefit = await db.benefits.findOne({
                  where: { name },
                  transaction: t,
                });

                if (!benefit) {
                  benefit = await db.benefits.create(
                    { name },
                    { transaction: t }
                  );
                }

                await BenefitLinkModel.create(
                  {
                    plan_category_id: category.id,
                    benefit_id: benefit.id,
                    included: true,
                  },
                  { transaction: t }
                );
              }
            }
          };

          //---------------------------------------------
          // CREATE 4 CATEGORIES
          //---------------------------------------------
          await createCategory("inpatient", row.inpatient_desc, row.inpatient_copay, row.inpatient_benefits);
          await createCategory("outpatient", row.outpatient_desc, row.outpatient_copay, row.outpatient_benefits);
          await createCategory("optical", row.optical_desc, row.optical_copay, row.optical_benefits);
          await createCategory("dental", row.dental_desc, row.dental_copay, row.dental_benefits);

          successRows.push({ row: i + 2, plan: plan.name });

        } catch (err) {
          failedRows.push({ row: i + 2, reason: err.message });
        }
      }

      await t.commit();

      return responseModel.successResponse(1, "Bulk import completed", {
        total: rows.length,
        success: successRows.length,
        failed: failedRows.length,
        failedRows,
        successRows,
      });

    } catch (err) {
      if (t) await t.rollback();
      return responseModel.failResponse(0, "Bulk upload failed", {}, err.message);
    }
  }


}

module.exports = { InsurancePlansController };
