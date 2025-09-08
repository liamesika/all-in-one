# TODO: Add modules:
# module "s3_uploads" { source = "./modules/s3"; bucket_name = "${var.project}-${var.env}-uploads" }
# module "s3_outputs" { source = "./modules/s3"; bucket_name = "${var.project}-${var.env}-outputs" }
# module "queue_jobs" { source = "./modules/sqs";  name = "${var.project}-${var.env}-jobs" }
# module "aurora"     { source = "./modules/aurora"; name = "${var.project}-${var.env}" }
