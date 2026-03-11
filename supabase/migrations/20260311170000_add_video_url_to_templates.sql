-- Add video_url column to templates for embedding YouTube/Vimeo safety videos
ALTER TABLE public.templates
ADD COLUMN IF NOT EXISTS video_url text;

-- Update get_envelope_by_token to return require_video and video_url
CREATE OR REPLACE FUNCTION public.get_envelope_by_token(p_token uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'id', e.id,
    'status', e.status,
    'signer_name', e.signer_name,
    'signer_email', e.signer_email,
    'signing_token', e.signing_token,
    'payload', e.payload,
    'is_group_waiver', e.is_group_waiver,
    'group_token', e.group_token,
    'template_version_id', e.template_version_id,
    'template_content', tv.content,
    'template_variables', tv.variables,
    'require_photo', COALESCE(t.require_photo, false),
    'require_video', COALESCE(t.require_video, false),
    'video_url', t.video_url
  ) INTO result
  FROM public.envelopes e
  JOIN public.template_versions tv ON tv.id = e.template_version_id
  JOIN public.templates t ON t.id = tv.template_id
  WHERE e.signing_token = p_token;

  RETURN result;
END;
$$;
